use thiserror::Error;

#[derive(Debug, Error)]
pub enum ShadowSigError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Invalid request: {0}")]
    BadRequest(String),

    #[error("Nullifier already consumed")]
    NullifierConsumed,

    #[error("Proof verification failed: {0}")]
    ProofVerificationFailed(String),

    #[error("Threshold not reached: {current}/{required}")]
    ThresholdNotReached { current: i32, required: i32 },

    #[error("Proposal expired")]
    ProposalExpired,

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl ShadowSigError {
    pub fn status_code(&self) -> u16 {
        match self {
            Self::NotFound(_) => 404,
            Self::BadRequest(_) => 400,
            Self::NullifierConsumed => 409,
            Self::ProofVerificationFailed(_) => 422,
            Self::ThresholdNotReached { .. } => 422,
            Self::ProposalExpired => 410,
            Self::Unauthorized(_) => 401,
            _ => 500,
        }
    }
}
