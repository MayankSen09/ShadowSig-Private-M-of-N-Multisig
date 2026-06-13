const API_URL = process.env.API_URL || 'http://localhost:8080/api';

async function seed() {
  console.log('🌱 Seeding ShadowSig Database...');

  try {
    // 1. Create a Multisig
    console.log('\n[1/3] Creating Multisig (Treasury)...');
    const multisigReq = {
      name: 'ShadowSig Treasury',
      description: 'Main treasury for protocol grants and operations.',
      threshold: 3,
      member_commitments: [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        '0x9999999999999999999999999999999999999999999999999999999999999999',
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x5555555555555555555555555555555555555555555555555555555555555555',
      ],
    };

    const multisigRes = await fetch(`${API_URL}/multisigs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(multisigReq),
    });
    const multisigData = await multisigRes.json();
    if (!multisigData.success) throw new Error(`Failed to create multisig: ${multisigData.error}`);
    const multisigId = multisigData.data.id;
    console.log(`✅ Created Multisig: ${multisigId}`);

    // 2. Create Proposals
    console.log('\n[2/3] Creating Proposals...');
    const proposals = [
      {
        multisig_id: multisigId,
        title: 'Q3 Developer Grants Distribution',
        description: 'Distribute 500k LEZ to core contributors.',
        action_type: 'transfer',
        action_data: { recipient: '0xabc...', amount: 500000 },
      },
      {
        multisig_id: multisigId,
        title: 'Upgrade Verifier Contract',
        description: 'Upgrade the core Groth16 verifier contract to v2.',
        action_type: 'contract_upgrade',
        action_data: { contract: '0xdef...', new_impl: '0x123...' },
      },
    ];

    const createdProposals = [];
    for (const p of proposals) {
      const pRes = await fetch(`${API_URL}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const pData = await pRes.json();
      if (!pData.success) throw new Error(`Failed to create proposal: ${pData.error}`);
      createdProposals.push(pData.data);
      console.log(`✅ Created Proposal: ${pData.data.title}`);
    }

    // 3. Submit Approvals (Simulating Zero-Knowledge Proofs)
    console.log('\n[3/3] Submitting ZK Approvals...');
    // Approve the first proposal 3 times to hit threshold
    const targetProposalId = createdProposals[0].id;

    for (let i = 0; i < 3; i++) {
      // Fake a 32-byte nullifier
      const nullifier = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      // Fake proof
      const proof = '00'.repeat(128); // 128 bytes dummy proof

      const aRes = await fetch(`${API_URL}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: targetProposalId,
          nullifier,
          proof,
        }),
      });
      const aData = await aRes.json();
      if (!aData.success) throw new Error(`Failed to submit approval: ${aData.error}`);
      console.log(`✅ Submitted Approval with Nullifier: ${nullifier.slice(0, 16)}...`);
    }

    console.log('\n🎉 Seeding complete! Check your dashboard at http://localhost:3000');

  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
  }
}

seed();
