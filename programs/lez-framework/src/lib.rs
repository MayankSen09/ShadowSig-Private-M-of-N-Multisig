pub use lez_framework_macros::{lez_program, account, event, error_code, Accounts, msg, AnchorSerialize, AnchorDeserialize};

pub mod prelude {
    pub use crate::{declare_id, emit, require};
    pub use crate::{lez_program, account, event, error_code, Accounts, msg, AnchorSerialize, AnchorDeserialize};
    pub use crate::lez_zkvm;
    pub use crate::VerifierError;
    
    pub type Result<T> = std::result::Result<T, Error>;
    
    #[derive(Debug, thiserror::Error, serde::Serialize, serde::Deserialize, Copy, Clone, PartialEq, Eq)]
    pub enum Error {
        #[error("InvalidThreshold")]
        InvalidThreshold,
        #[error("ProposalExecuted")]
        ProposalExecuted,
        #[error("ThresholdNotReached")]
        ThresholdNotReached,
        #[error("InvalidMerkleRoot")]
        InvalidMerkleRoot,
        #[error("InvalidProof")]
        InvalidProof,
    }
    

    #[derive(Clone, Copy, Default, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
    pub struct Pubkey(pub [u8; 32]);
    
    impl Pubkey {
        pub fn key(&self) -> Self {
            *self
        }
    }

    impl std::fmt::Display for Pubkey {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "{}", hex::encode(self.0))
        }
    }
    
    pub struct Context<'a, T> {
        pub accounts: &'a mut T,
        pub _phantom: std::marker::PhantomData<&'a T>,
    }
    
    #[derive(Clone)]
    pub struct Account<'info, T> {
        pub inner: T,
        pub key: Pubkey,
        pub _phantom: std::marker::PhantomData<&'info T>,
    }
    
    impl<'info, T> std::ops::Deref for Account<'info, T> {
        type Target = T;
        fn deref(&self) -> &Self::Target {
            &self.inner
        }
    }
    
    impl<'info, T> std::ops::DerefMut for Account<'info, T> {
        fn deref_mut(&mut self) -> &mut Self::Target {
            &mut self.inner
        }
    }

    impl<'info, T> Account<'info, T> {
        pub fn key(&self) -> Pubkey {
            self.key
        }
    }
    
    pub struct Signer<'info> {
        pub key: &'info Pubkey,
    }
    
    pub struct Program<'info, T> {
        pub _phantom: std::marker::PhantomData<&'info T>,
    }
    
    pub struct System;
    
    pub struct Clock {
        pub unix_timestamp: i64,
    }
    
    impl Clock {
        pub fn get() -> std::result::Result<Self, Error> {
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64;
            Ok(Self {
                unix_timestamp: timestamp,
            })
        }
    }
}

pub mod lez_zkvm {
    use super::prelude::Error;
    
    /// Verifies the receipt against the public journal.
    /// In our simulated environment, the receipt_bytes is just the JSON-serialized
    /// Journal itself, so we check if the deserialized journal matches the expected one.
    pub fn verify_receipt(receipt_bytes: &[u8], expected_journal: &[u8]) -> Result<(), Error> {
        if receipt_bytes == expected_journal {
            return Ok(());
        }
        
        // As a fallback, check if receipt_bytes is hex-encoded journal
        if let Ok(decoded) = hex::decode(receipt_bytes) {
            if decoded == expected_journal {
                return Ok(());
            }
        }
        
        // Otherwise, try to deserialize both as serde_json::Value and compare
        let v1: serde_json::Value = serde_json::from_slice(receipt_bytes).map_err(|_| Error::InvalidProof)?;
        let v2: serde_json::Value = serde_json::from_slice(expected_journal).map_err(|_| Error::InvalidProof)?;
        if v1 == v2 {
            return Ok(());
        }
        
        Err(Error::InvalidProof)
    }
}

#[macro_export]
macro_rules! declare_id {
    ($id:expr) => {};
}

#[macro_export]
macro_rules! require {
    ($cond:expr, $err:expr) => {
        if !$cond {
            return Err($err.into());
        }
    };
}

#[macro_export]
macro_rules! emit {
    ($event:expr) => {
        println!("Event emitted: {:?}", serde_json::to_string(&$event).unwrap_or_default());
    };
}

// Re-export this for macro expansion use
pub use crate::prelude::Error as VerifierError;
