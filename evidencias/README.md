# Evidências

Prints tirados no Minikube do grupo. Salve as imagens nesta pasta com os nomes abaixo.

| Arquivo | Comando ou tela |
|---|---|
| `01-minikube.png` | `minikube status` e `kubectl get nodes` |
| `02-imagens.png` | `minikube image ls \| Select-String reserva` |
| `03-pods.png` | `kubectl get pods -o wide` |
| `04-services.png` | `kubectl get services` |
| `05-deployments.png` | `kubectl get deployments` |
| `06-aplicacao.png` | Navegador com a aplicação e os dados cadastrados |
| `07-balanceamento.png` | Loop do `Invoke-RestMethod` mostrando pods diferentes |
| `08-pod-excluido.png` | `kubectl delete pod ...` e `kubectl get pods -l app=backend` mostrando o pod novo |
| `09-configmap-secret.png` | `kubectl get configmap,secret` |
| `10-persistencia.png` | Dados ainda na tela depois de excluir o pod do Postgres |
| `11-pipeline.png` | Aba Actions do GitHub com a pipeline verde |
