FROM rust:latest AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY . .
RUN cargo build --release --bin shadowsig-verifier

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/shadowsig-verifier /usr/local/bin/shadowsig-verifier
EXPOSE 9090
CMD ["shadowsig-verifier"]
