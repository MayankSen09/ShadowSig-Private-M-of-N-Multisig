use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, ItemMod};

#[proc_macro_attribute]
pub fn lez_program(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as ItemMod);

    let expanded = quote! {
        #input

        // Auto-generated mock VerifierState to satisfy the mock blockchain node interface
        pub struct VerifierState {
            pub multisigs: std::collections::HashMap<[u8; 32], MultisigConfig>,
            pub proposals: std::collections::HashMap<[u8; 32], Proposal>,
            pub nullifiers: std::collections::HashSet<[u8; 32]>,
        }

        impl VerifierState {
            pub fn new() -> Self {
                Self {
                    multisigs: std::collections::HashMap::new(),
                    proposals: std::collections::HashMap::new(),
                    nullifiers: std::collections::HashSet::new(),
                }
            }

            pub fn create_multisig(&mut self, id: [u8; 32], merkle_root: [u8; 32], threshold: u8, member_count: u8) -> std::result::Result<(), lez_framework::prelude::Error> {
                let config = MultisigConfig {
                    merkle_root,
                    threshold,
                    member_count,
                    authority: lez_framework::prelude::Pubkey(id), // Mock pubkey
                };
                self.multisigs.insert(id, config);
                Ok(())
            }

            pub fn create_proposal(&mut self, proposal_id: [u8; 32], multisig_id: [u8; 32], action_hash: [u8; 32]) -> std::result::Result<(), lez_framework::prelude::Error> {
                let proposal = Proposal {
                    multisig: lez_framework::prelude::Pubkey(multisig_id),
                    action_hash,
                    approvals: 0,
                    executed: false,
                };
                self.proposals.insert(proposal_id, proposal);
                Ok(())
            }

            pub fn submit_approval(&mut self, journal: &ProofJournal, receipt_bytes: &[u8]) -> std::result::Result<u32, lez_framework::prelude::Error> {
                // Determine multisig ID (look up matching root)
                let multisig_id = self.multisigs.iter()
                    .find(|(_, m)| m.merkle_root == journal.merkle_root)
                    .map(|(k, _)| *k)
                    .ok_or(lez_framework::prelude::Error::InvalidMerkleRoot)?;

                let proposal_key = journal.proposal_id;
                let proposal = self.proposals.get_mut(&proposal_key)
                    .ok_or(lez_framework::prelude::Error::InvalidProof)?;

                if proposal.executed {
                    return Err(lez_framework::prelude::Error::ProposalExecuted);
                }

                // Verify the receipt bytes (using the simulated zkVM verification)
                lez_framework::lez_zkvm::verify_receipt(receipt_bytes, &journal.serialize().map_err(|_| lez_framework::prelude::Error::InvalidProof)?)
                    .map_err(|_| lez_framework::prelude::Error::InvalidProof)?;

                // Record nullifier to prevent double voting
                if self.nullifiers.contains(&journal.nullifier_hash) {
                    return Err(lez_framework::prelude::Error::InvalidProof);
                }
                self.nullifiers.insert(journal.nullifier_hash);

                proposal.approvals += 1;
                Ok(proposal.approvals)
            }

            pub fn execute_proposal(&mut self, proposal_id: [u8; 32]) -> std::result::Result<[u8; 32], lez_framework::prelude::Error> {
                let proposal = self.proposals.get_mut(&proposal_id)
                    .ok_or(lez_framework::prelude::Error::InvalidProof)?;

                let multisig = self.multisigs.get(&proposal.multisig.0)
                    .ok_or(lez_framework::prelude::Error::InvalidProof)?;

                if proposal.executed {
                    return Err(lez_framework::prelude::Error::ProposalExecuted);
                }
                if proposal.approvals < multisig.threshold as u32 {
                    return Err(lez_framework::prelude::Error::ThresholdNotReached);
                }

                proposal.executed = true;
                Ok(proposal.action_hash)
            }
        }
    };
    expanded.into()
}

#[proc_macro_attribute]
pub fn account(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let item_struct = parse_macro_input!(item as syn::ItemStruct);
    let expanded = quote! {
        #[derive(serde::Serialize, serde::Deserialize, Clone)]
        #item_struct
    };
    expanded.into()
}

#[proc_macro_attribute]
pub fn event(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let item_struct = parse_macro_input!(item as syn::ItemStruct);
    let expanded = quote! {
        #[derive(serde::Serialize, serde::Deserialize, Clone)]
        #item_struct
    };
    expanded.into()
}

#[proc_macro_attribute]
pub fn error_code(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let mut item_enum = parse_macro_input!(item as syn::ItemEnum);
    for variant in &mut item_enum.variants {
        variant.attrs.retain(|attr| !attr.path().is_ident("msg"));
    }
    let name = &item_enum.ident;
    
    let expanded = quote! {
        #[derive(serde::Serialize, serde::Deserialize, Debug, Copy, Clone, PartialEq, Eq)]
        #item_enum

        impl From<#name> for lez_framework::prelude::Error {
            fn from(err: #name) -> Self {
                match err {
                    #name::InvalidThreshold => lez_framework::prelude::Error::InvalidThreshold,
                    #name::ProposalExecuted => lez_framework::prelude::Error::ProposalExecuted,
                    #name::ThresholdNotReached => lez_framework::prelude::Error::ThresholdNotReached,
                    #name::InvalidMerkleRoot => lez_framework::prelude::Error::InvalidMerkleRoot,
                    #name::InvalidProof => lez_framework::prelude::Error::InvalidProof,
                }
            }
        }
    };
    expanded.into()
}

#[proc_macro_derive(Accounts, attributes(account, instruction))]
pub fn derive_accounts(_item: TokenStream) -> TokenStream {
    TokenStream::new()
}

#[proc_macro_attribute]
pub fn msg(_attr: TokenStream, item: TokenStream) -> TokenStream {
    item
}

#[proc_macro_derive(AnchorSerialize)]
pub fn derive_anchor_serialize(item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as syn::DeriveInput);
    let name = &input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();
    
    let fields = match &input.data {
        syn::Data::Struct(syn::DataStruct { fields: syn::Fields::Named(fields), .. }) => {
            &fields.named
        }
        _ => panic!("Only structs with named fields are supported"),
    };
    
    let serialize_fields = fields.iter().map(|f| {
        let field_name = &f.ident;
        let field_str = field_name.as_ref().unwrap().to_string();
        quote! {
            state.serialize_field(#field_str, &self.#field_name)?;
        }
    });
    
    let struct_name_str = name.to_string();
    let fields_len = fields.len();

    let expanded = quote! {
        impl #impl_generics serde::Serialize for #name #ty_generics #where_clause {
            fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
            where
                S: serde::Serializer,
            {
                use serde::ser::SerializeStruct;
                let mut state = serializer.serialize_struct(#struct_name_str, #fields_len)?;
                #(#serialize_fields)*
                state.end()
            }
        }

        impl #impl_generics #name #ty_generics #where_clause {
            pub fn serialize(&self) -> std::result::Result<std::vec::Vec<u8>, lez_framework::prelude::Error> {
                serde_json::to_vec(self).map_err(|_| lez_framework::prelude::Error::InvalidProof)
            }
        }
    };
    expanded.into()
}

#[proc_macro_derive(AnchorDeserialize)]
pub fn derive_anchor_deserialize(item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as syn::DeriveInput);
    let name = &input.ident;
    
    let mut generics = input.generics.clone();
    let de_lifetime: syn::LifetimeParam = syn::parse_quote!('de);
    generics.params.insert(0, syn::GenericParam::Lifetime(de_lifetime));
    let (impl_generics, _, _) = generics.split_for_impl();
    let (_, ty_generics, where_clause) = input.generics.split_for_impl();
    
    let fields = match &input.data {
        syn::Data::Struct(syn::DataStruct { fields: syn::Fields::Named(fields), .. }) => {
            &fields.named
        }
        _ => panic!("Only structs with named fields are supported"),
    };
    
    let field_names = fields.iter().map(|f| &f.ident);
    let field_names_clone = field_names.clone();
    
    let shadow_fields = fields.iter().map(|f| {
        let field_name = &f.ident;
        let field_ty = &f.ty;
        quote! {
            #field_name: #field_ty,
        }
    });

    let expanded = quote! {
        impl #impl_generics serde::Deserialize<'de> for #name #ty_generics #where_clause {
            fn deserialize<D>(deserializer: D) -> std::result::Result<Self, D::Error>
            where
                D: serde::Deserializer<'de>,
            {
                #[derive(serde::Deserialize)]
                struct ShadowStruct {
                    #(#shadow_fields)*
                }
                let shadow = ShadowStruct::deserialize(deserializer)?;
                Ok(Self {
                    #(#field_names_clone: shadow.#field_names,)*
                })
            }
        }
    };
    expanded.into()
}
