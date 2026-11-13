# Cabeçalhos comuns do repasse para a API (incluído por /auth/ e /forum-api/ em nginx.conf).
proxy_http_version 1.1;
proxy_set_header Connection "";
proxy_set_header Host $host_externo;
proxy_set_header X-Forwarded-Host $host_externo;
proxy_set_header X-Forwarded-Proto $proto_externo;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;

# A API devolve redirecionamentos absolutos (callback do SSO volta ao site); não reescrever.
proxy_redirect off;

proxy_connect_timeout 5s;
proxy_read_timeout 60s;
proxy_send_timeout 60s;
