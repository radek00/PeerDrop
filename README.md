# Peerdrop

Peerdrop is an open source application designed for sharing files between devices on the same network. It uses WebRTC for direct peer-to-peer communication and supports large files.

## Features

*   P2P file sharing over WebRTC
*   Support for large files by streaming directly to disk
*   PWA support
*   Easily self-hostable

# Installation
It is advised to use a reverse proxy like Traefik for self-hosting.

## Docker setup with self-signed certificate

```yaml
services:
  localShare:
    image: chupacabra500/PeerDrop:latest
    build:
      dockerfile: ./Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=https://+:443;http://+:80
      - ASPNETCORE_Kestrel__Certificates__Default__Password=crypticpassword
      - ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx
    volumes:
      - ./aspnetapp.pfx:/https/aspnetapp.pfx:ro
    ports:
      - 8080:80
      - 8443:443
```

### Generating a Self-Signed Certificate

For local development and testing with HTTPS, you can generate a self-signed certificate using PowerShell.

1.  **Generate the certificate:**

    ```powershell
    $cert = New-SelfSignedCertificate -DnsName @("localhost") -CertStoreLocation "cert:\\LocalMachine\\My"
    ```

2.  **Export the certificate to a .pfx file:**

    Replace `"yourpassword"` with a strong password. This password will be used in your `docker-compose.yaml` or application configuration.

    ```powershell
    $password = ConvertTo-SecureString -String "yourpassword" -AsPlainText -Force
    Export-PfxCertificate -Cert $cert -FilePath ".\\aspnetapp.pfx" -Password $password
    ```

    This command exports the certificate to `aspnetapp.pfx` in the current directory. Ensure this path matches the volume mount in your `docker-compose.yaml` (`./aspnetapp.pfx:/https/aspnetapp.pfx:ro`) and the certificate path configured in your application.

3.  **Trust the certificate (optional but recommended for development):**

    To avoid browser warnings, you can import the certificate into the Trusted Root Certification Authorities store.

    ```powershell
    Import-PfxCertificate -FilePath ".\\aspnetapp.pfx" -CertStoreLocation 'Cert:\\LocalMachine\\Root' -Password $password
    ```

    **Note:** Remember to update the `ASPNETCORE_Kestrel__Certificates__Default__Password` in your `docker-compose.yaml` or environment configuration to match the password you chose.

## Docker setup with Traefik and DNS challenge
```yaml
networks:
  proxy:
  secureSend:
volumes:
  secureSend:
services:
  #reverse proxy
  traefik:
    image: "traefik:v2.4"
    container_name: "traefik"
    restart: unless-stopped
    command:
      - "--log.level=DEBUG"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.dns.address=:53"
      - "--entrypoints.udpdns.address=:53/udp"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"
      - "--entrypoints.https.http.tls.certresolver=myresolver"
      - "--entrypoints.https.http.tls.domains[0].main=${BASE_DOMAIN}"
      - "--entrypoints.https.http.tls.domains[0].sans=*.${BASE_DOMAIN}"
      - "--certificatesresolvers.myresolver.acme.dnschallenge=true"
      - "--certificatesresolvers.myresolver.acme.dnschallenge.provider=cloudflare"
      - "--certificatesresolvers.myresolver.acme.email=${API_EMAIL}"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.myresolver.acme.dnschallenge.resolvers=1.1.1.1:53,8.8.8.8:53"
      - "--certificatesresolvers.myresolver.acme.dnschallenge.delaybeforecheck=90"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    environment:
      - "CF_API_EMAIL=${API_EMAIL}"
      - "CF_API_KEY=${API_KEY}"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.${BASE_DOMAIN}`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=myresolver"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.services.traefik.loadbalancer.server.port=8080"
    networks:
      proxy:
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
  peerdrop:
    image: chupacabra500/PeerDrop:latest
    labels:
      - traefik.enable=true
      - traefik.http.services.securesned.loadbalancer.server.port=80
      - traefik.http.routers.securesend.rule=Host(`peerdrop.${BASE_DOMAIN}`)
      - traefik.http.routers.securesend.tls.certresolver=myresolver
      - traefik.http.routers.securesend.entrypoints=websecure
      - traefik.docker.network=proxy
    networks:
      - proxy                    
```
