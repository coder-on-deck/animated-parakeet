from build.client import JsonWireClient

client = JsonWireClient(baseUrl='http://localhost:9515')
status = client.getStatus()
print status
