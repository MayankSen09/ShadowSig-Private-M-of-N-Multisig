output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "db_endpoint" {
  description = "Database connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "db_password" {
  description = "Database password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis connection endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}
