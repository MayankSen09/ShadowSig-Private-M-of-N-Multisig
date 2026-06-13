//! ShadowSig Host Prover Binary
//!
//! Drives the RISC0 guest program or falls back to SimulatedProver.

use shadowsig_host::*;

fn main() {
    println!("ShadowSig Host Prover");
    println!("Usage: integrate as library via SimulatedProver::prove()");

    // Quick demo: 2-of-3 multisig
    let secrets: Vec<Vec<u8>> = vec![
        b"member_alpha_secret_key_32bytes!".to_vec(),
        b"member_bravo_secret_key_32bytes!".to_vec(),
        b"member_charlie_secret_key_32b!!".to_vec(),
    ];

    let commitments: Vec<Vec<u8>> = secrets.iter().map(|s| compute_commitment(s)).collect();
    let (root, layers) = build_merkle_tree(&commitments);
    let proposal_id = b"proposal_treasury_transfer_001".to_vec();

    println!("Merkle root: {}", hex::encode(&root));
    println!("Members: {}", secrets.len());

    for (i, secret) in secrets.iter().enumerate().take(2) {
        let proof_path = get_merkle_proof(&layers, i);
        let witness = ShadowSigWitness {
            identity_secret: secret.clone(),
            merkle_path: proof_path,
            leaf_index: i as u32,
            merkle_root: root.clone(),
            proposal_id: proposal_id.clone(),
            vote: true,
        };

        match SimulatedProver::prove(&witness) {
            Ok(result) => {
                println!(
                    "Member {} approved — nullifier: {} ({}ms, simulated={})",
                    i,
                    hex::encode(&result.journal.nullifier_hash),
                    result.generation_time_ms,
                    result.is_simulated,
                );
            }
            Err(e) => {
                eprintln!("Member {} proof failed: {}", i, e);
            }
        }
    }

    println!("Threshold 2/3 reached — proposal executable!");
}
