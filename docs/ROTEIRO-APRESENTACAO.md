# Roteiro da apresentação

## Antes de começar (fazer com antecedência)

```powershell
minikube start --driver=docker
minikube image build -t reserva-backend:1.0 .\backend
minikube image build -t reserva-frontend:1.0 .\frontend
kubectl apply -f k8s/
kubectl get pods            # tudo Running 1/1
```

- **Terminal 1:** `minikube service frontend --url`. Deixe aberto e abra a URL no navegador.
- **Terminal 2:** `$URL = "http://127.0.0.1:<porta>"`
- Crie 1 unidade, 1 setor, 1 sala e 1 reserva antes, para a tela não ficar vazia.

---

## Sequência da demonstração (cerca de 6 min)

| # | O que fazer | O que falar |
|---|---|---|
| 1 | Mostrar a aplicação no navegador e criar uma sala | "É o mesmo sistema do Mensal 1. Antes rodava em S3, Elastic Beanstalk e RDS; agora tudo roda dentro do Minikube." |
| 2 | `kubectl get pods -o wide` | "6 pods: 2 de frontend, 3 de backend e 1 de banco. A coluna IP mostra que cada pod tem seu IP dentro do cluster." |
| 3 | `kubectl get services` | "frontend é NodePort, a única porta aberta para fora. backend e postgres são ClusterIP e só existem dentro do cluster." |
| 4 | `kubectl get deployments` | "Os Deployments declaram quantas réplicas queremos: 2, 3 e 1. READY mostra que estão todas de pé." |
| 5 | `1..10 \| ForEach-Object { (Invoke-RestMethod -DisableKeepAlive "$URL/api/").pod }` | "Cada resposta vem de um pod diferente: o Service backend está balanceando." |
| 6 | `kubectl delete pod <pod-do-backend>` e `kubectl get pods -l app=backend -w` | "Excluí um pod e o Deployment criou outro na hora, porque o estado desejado é 3 réplicas. A aplicação não parou." |
| 7 | Mostrar o diagrama (`docs/arquitetura.png`) | Explicar a comunicação (texto abaixo). |
| 8 (extra) | `kubectl delete pod -l app=postgres`, esperar e recarregar o navegador | "Os dados continuam porque estão no PersistentVolumeClaim, não dentro do pod." |

---

## Explicação da comunicação (falar com o diagrama)

1. O usuário acessa o **Service frontend** (NodePort). No Windows o `minikube service` abre um túnel até ele.
2. O Service entrega para um dos **2 pods do frontend**. Cada pod é um nginx com o React compilado.
3. O React chama `/api/...` no mesmo endereço. O nginx repassa para `http://backend:3000`.
4. `backend` é o nome do **Service do backend**. O DNS interno do cluster (CoreDNS) resolve esse nome para o IP do Service, e o kube-proxy escolhe um dos **3 pods** da API.
5. A API conecta em `postgres:5432`, o **Service do banco**, também resolvido pelo DNS.
6. Usuário e senha do banco vêm do **Secret**; host, porta e nome do banco vêm do **ConfigMap**.
7. O banco grava num **PVC**, então os dados não se perdem quando o pod é recriado.

---

## Perguntas prováveis e respostas curtas

**Pod, ReplicaSet e Deployment: qual a diferença?**
O Pod é a menor unidade e roda os containers. O ReplicaSet garante que existam N pods iguais. O Deployment gerencia ReplicaSets e permite atualizar a versão sem derrubar a aplicação (rolling update). Nós só escrevemos o Deployment.

**Como o Kubernetes recriou o pod?**
O controlador do ReplicaSet compara o estado desejado (3 réplicas) com o estado atual (2) e cria o que falta. Isso se chama reconciliação.

**Por que precisa de Service se cada pod tem IP?**
O IP do pod muda toda vez que ele é recriado. O Service tem IP e nome fixos e distribui entre os pods que têm o label certo (`app: backend`).

**ClusterIP, NodePort e LoadBalancer?**
ClusterIP só é acessível dentro do cluster (backend e banco). NodePort abre uma porta no nó (frontend, 30080). LoadBalancer pede um balanceador ao provedor de nuvem; no Minikube só funciona com `minikube tunnel`.

**Como o frontend encontra o backend?**
Pelo nome do Service, `backend`, resolvido pelo CoreDNS. Nada de IP fixo. O endereço está no ConfigMap (`BACKEND_URL`).

**Por que o nginx faz proxy em vez de o navegador chamar o backend direto?**
Assim o backend não precisa ser exposto para fora (fica ClusterIP), não há problema de CORS e o site e a API ficam no mesmo endereço.

**Como o balanceamento acontece?**
O kube-proxy cria regras no nó que distribuem cada nova conexão entre os pods prontos do Service. O nginx abre uma conexão nova por requisição, por isso cada chamada pode cair num pod diferente.

**Para que servem as probes?**
A readinessProbe (`/health`, que testa o banco) decide se o pod recebe tráfego. A livenessProbe decide se o container precisa ser reiniciado. Se o banco cair, os pods do backend saem do balanceamento e voltam sozinhos.

**O que é o initContainer do backend?**
Um container que roda antes da API e só termina quando o Postgres aceita conexões (`pg_isready`). Evita que a API suba antes do banco.

**ConfigMap e Secret: qual a diferença?**
ConfigMap guarda configuração comum. Secret guarda dados sensíveis, fica separado e pode ter permissão de acesso diferente. Mas é só base64, não é criptografia: em produção viria de um cofre.

**Por que o banco tem só 1 réplica?**
Dois Postgres gravando no mesmo volume corrompem os dados. Replicar banco exige replicação do próprio Postgres (StatefulSet ou operador). Por isso o Deployment do banco usa a estratégia `Recreate`.

**Por que Deployment e não StatefulSet no banco?**
O enunciado pede Deployments e, com 1 réplica e um PVC, funciona igual. Com várias réplicas de banco o certo seria StatefulSet, que dá nome e volume fixos para cada pod.

**Como as imagens chegam no Minikube?**
`minikube image build` constrói a imagem dentro do Docker do próprio Minikube. Como a tag é fixa (`1.0`) e o `imagePullPolicy` é `IfNotPresent`, o cluster usa a imagem local sem procurar no Docker Hub.

**Por que Dockerfile multi-stage?**
A primeira etapa tem as ferramentas de build (TypeScript, Vite). A imagem final leva só o resultado: fica menor e com menos coisa para atacar. O backend ainda roda como usuário `node`, não como root.

**O que muda em relação à AWS do Mensal 1?**
O ALB virou o Service, o Auto Scaling Group virou o ReplicaSet, o S3 virou o nginx, o RDS virou o Postgres com PVC, e as variáveis do Beanstalk viraram ConfigMap e Secret. A diferença é que tudo roda num cluster só e é descrito em YAML.

**Limitações?**
Um nó só (não aguenta falha da máquina), banco sem réplica, Secret no Git, sem HTTPS, sem Ingress e sem autoscaling.

**Melhorias futuras?**
Ingress com HTTPS, HPA para escalar pela CPU, Postgres com StatefulSet ou operador, segredos fora do Git, NetworkPolicy ativa com Calico e deploy contínuo num cluster de nuvem.

**Tem CI/CD?**
Tem CI: a cada push o GitHub Actions compila, valida os YAML e sobe tudo num Minikube temporário, testando balanceamento e recriação de pod. O deploy no Minikube é local, porque o cluster roda na máquina de quem apresenta.
