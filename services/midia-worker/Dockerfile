# Worker de otimização de mídia. Construa a partir da RAIZ do repositório:
#   docker build -f services/midia-worker/Dockerfile -t agrodireto-midia-worker .
#   docker run --rm -p 8080:8080 --env-file services/midia-worker/.env agrodireto-midia-worker
FROM node:24-bookworm-slim

# O FFmpeg do Debian já traz libx265 (H.265), libsvtav1 (AV1) e libvmaf (nota de qualidade).
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# O build FALHA se faltar algum recurso que o worker exige (em vez de falhar só quando chegar o primeiro vídeo).
RUN ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx265 \
 && ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libsvtav1 \
 && ffmpeg -hide_banner -filters 2>/dev/null | grep -q libvmaf

WORKDIR /app
# Workspace mínimo: só o worker e o pacote de contratos que ele usa.
RUN printf '{"name":"agrodireto-worker","private":true,"workspaces":["packages/*","services/*"]}' > package.json
COPY packages/dominio packages/dominio
COPY services/midia-worker services/midia-worker
RUN npm install --omit=dev --legacy-peer-deps

ENV NODE_ENV=production PORT=8080
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/saude').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "services/midia-worker/src/servidor.ts"]
