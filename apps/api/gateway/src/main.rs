use axum::{
    routing::{get, post},
    Router,
};
use deadpool_redis::{Config as RedisConfig, Runtime};
use shadowsig_event_service::EventBus;
use std::sync::Arc;
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod middleware;
mod routes;

pub struct AppState {
    pub start_time: Instant,
    pub db_pool: sqlx::PgPool,
    pub redis_pool: deadpool_redis::Pool,
    pub http_client: reqwest::Client,
    pub lez_rpc_url: String,
    /// Real-time event bus — broadcast channel for WebSocket clients.
    pub event_bus: Arc<EventBus>,
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
    let db_pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(config.max_db_connections)
        .connect(&config.database_url)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))?;

    // Run migrations
    tracing::info!("Running database migrations...");
    sqlx::migrate!("../migrations")
        .run(&db_pool)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to run database migrations: {}", e))?;

    // Spawn background task: expire stale proposals every 60 seconds
    {
        let pool = db_pool.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
            loop {
                interval.tick().await;
                match sqlx::query(
                    "UPDATE proposals SET status = 'expired', updated_at = NOW() \
                     WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < NOW()",
                )
                .execute(&pool)
                .await
                {
                    Ok(r) if r.rows_affected() > 0 => {
                        tracing::info!("⏰ Expired {} stale proposals", r.rows_affected());
                    }
                    Err(e) => tracing::warn!("Proposal expiry scan error: {}", e),
                    _ => {}
                }
            }
        });
    }

    // Setup Redis pool
    tracing::info!("Connecting to Redis at {}...", config.redis_url);
    let redis_cfg = RedisConfig::from_url(&config.redis_url);
    let redis_pool = redis_cfg
        .create_pool(Some(Runtime::Tokio1))
        .map_err(|e| anyhow::anyhow!("Failed to create Redis pool: {}", e))?;

    let state = Arc::new(AppState {
        start_time: Instant::now(),
        db_pool,
        redis_pool,
        http_client: reqwest::Client::new(),
        lez_rpc_url: config.lez_rpc_url,
        event_bus: EventBus::new(),
    });

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Custom TraceLayer configuration for detailed instrumentation
    let trace_layer = TraceLayer::new_for_http()
        .make_span_with(tower_http::trace::DefaultMakeSpan::new().level(tracing::Level::INFO))
        .on_request(tower_http::trace::DefaultOnRequest::new().level(tracing::Level::INFO))
        .on_response(tower_http::trace::DefaultOnResponse::new().level(tracing::Level::INFO));

    // Build router
    let app = Router::new()
        // Health
        .route("/health", get(routes::health::health_check))
        // WebSocket event stream
        .route("/api/ws", get(routes::ws::ws_handler))
        // Protected routes (require JWT auth)
        .nest(
            "/api",
            Router::new()
                .route("/proposals", post(routes::proposals::create_proposal))
                .route("/approvals", post(routes::approvals::submit_approval))
                .route_layer(axum::middleware::from_fn_with_state(
                    state.clone(),
                    middleware::auth::auth_middleware,
                )),
        )
        // Public API routes
        // Auth
        .route("/api/auth/token", post(routes::auth::generate_token))
        // Multisigs
        .route("/api/multisigs", get(routes::multisigs::list_multisigs))
        .route("/api/multisigs", post(routes::multisigs::create_multisig))
        .route("/api/multisigs/{id}", get(routes::multisigs::get_multisig))
        .route("/api/multisigs/{id}/members", get(routes::multisigs::get_members))
        // Proposals (read-only are public)
        .route("/api/proposals", get(routes::proposals::list_proposals))
        .route("/api/proposals/{id}", get(routes::proposals::get_proposal))
        // Proofs
        .route("/api/proofs/generate", post(routes::proofs::generate_proof))
        .route("/api/proofs/{id}", get(routes::proofs::get_proof))
        // Execute
        .route("/api/execute", post(routes::execute::execute_action))
        // Metrics
        .route("/api/metrics", get(routes::metrics::get_metrics))
        // Treasury
        .route("/api/treasury", get(routes::treasury::list_all_treasury_actions))
        .route("/api/treasury/{multisig_id}", get(routes::treasury::list_treasury_actions))
        // Middleware
        .layer(cors)
        .layer(trace_layer)
        .with_state(state);

    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("🛡️  ShadowSig API Gateway starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
