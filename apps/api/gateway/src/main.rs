use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod routes;

pub struct AppState {
    pub start_time: Instant,
    pub db_pool: sqlx::PgPool,
    pub http_client: reqwest::Client,
    pub lez_rpc_url: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "shadowsig=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    dotenvy::dotenv().ok();

    let config = config::Config::from_env();

    // Connect to database
    tracing::info!(
        "Connecting to PostgreSQL database at {}...",
        config.database_url
    );
    let db_pool = sqlx::PgPool::connect(&config.database_url)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))?;

    // Run migrations
    tracing::info!("Running database migrations...");
    sqlx::migrate!("../migrations")
        .run(&db_pool)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to run database migrations: {}", e))?;

    let state = Arc::new(AppState {
        start_time: Instant::now(),
        db_pool,
        http_client: reqwest::Client::new(),
        lez_rpc_url: config.lez_rpc_url,
    });

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        // Health
        .route("/health", get(routes::health::health_check))
        // Multisigs
        .route("/api/multisigs", get(routes::multisigs::list_multisigs))
        .route("/api/multisigs", post(routes::multisigs::create_multisig))
        .route("/api/multisigs/{id}", get(routes::multisigs::get_multisig))
        .route("/api/multisigs/{id}/members", get(routes::multisigs::get_members))
        // Proposals
        .route("/api/proposals", get(routes::proposals::list_proposals))
        .route("/api/proposals", post(routes::proposals::create_proposal))
        .route("/api/proposals/{id}", get(routes::proposals::get_proposal))
        // Approvals
        .route("/api/approvals", post(routes::approvals::submit_approval))
        // Proofs
        .route("/api/proofs/generate", post(routes::proofs::generate_proof))
        .route("/api/proofs/{id}", get(routes::proofs::get_proof))
        // Execute
        .route("/api/execute", post(routes::execute::execute_action))
        // Metrics
        .route("/api/metrics", get(routes::metrics::get_metrics))
        // Middleware
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("🛡️  ShadowSig API Gateway starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
