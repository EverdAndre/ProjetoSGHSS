# SGHSS API

Sistema SGHSS desenvolvido em ASP.NET Core com Entity Framework Core e MySQL.

O projeto entrega uma API REST e tambem uma interface web integrada feita com HTML, CSS, JavaScript e Bootstrap, servida pela propria aplicacao a partir da pasta `wwwroot`. A interface possui tela de login e tela principal para testar os fluxos do sistema.

## Pre-requisitos
- Visual Studio Code ou IDE Similar para .Net
- [.NET SDK 9](https://learn.microsoft.com/dotnet/core/install/windows)
- [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Git](https://git-scm.com/downloads)
- Navegador de Internet, como Chrome, Edge ou Firefox

Para conferir se as ferramentas foram instaladas corretamente:

```bash
dotnet --version
docker --version
docker compose version
git --version
```

## Como rodar o projeto

### 1. Clonar o repositorio

```bash
git clone https://github.com/EverdAndre/ProjetoSGHSS
cd ProjetoSGHSS
```

### 2. Subir o banco MySQL com Docker

Na raiz do projeto, execute:

```bash
docker compose up -d
```

O `docker-compose.yml` sobe um MySQL local com:

```txt
Host: localhost
Porta: 3306
Banco: sghss
Usuario: everd
Senha: 2014
```

Se quiser recriar o banco do zero, apagando os dados anteriores:

```bash
docker compose down -v
docker compose up -d
```

### 3. Configurar a connection string

O projeto usa `user-secrets` para evitar salvar a connection string no Git.

Execute na raiz do projeto:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Port=3306;Database=sghss;User=everd;Password=2014;" --project SGHSS.Api
```

Para conferir os segredos configurados:

```bash
dotnet user-secrets list --project SGHSS.Api
```

Para testar login e gerar token JWT, configure tambem:

```bash
dotnet user-secrets set "Jwt:Key" "Ate_Aqui_n0s_gu@rdou_0_S&nh0r_._2026" --project SGHSS.Api
dotnet user-secrets set "Seed:AdminPassword" "Admin@123" --project SGHSS.Api
```

### 4. Rodar a API

```bash
dotnet run --launch-profile https
```

Ao iniciar, a API aplica as migrations automaticamente e cria um usuario admin inicial em ambiente de desenvolvimento.

### 5. Acessar o Swagger

Abra no navegador:

```txt
https://localhost:7192/swagger/index.html
```

Se a porta exibida no terminal for diferente, use a URL mostrada pelo `dotnet run`.

### 6. Acessar a interface da aplicacao

A aplicacao tambem possui interface web com tela de login.

Abra no navegador:

```txt
https://localhost:7192/pages/login.html
```

Se a porta exibida no terminal for diferente, use a mesma porta mostrada pelo `dotnet run`.

Exemplo:

```txt
https://localhost:<porta>/pages/login.html
```

## Usuario inicial

Quando o banco estiver vazio, o projeto cria automaticamente este usuario:

```txt
Email: admin@sghss.com
Senha: Admin@123
Perfil: Admin
```

Use esse usuario no endpoint de login para obter o token JWT.

## Acesso como Paciente ou Profissional de Saude

Para acessar a interface como `Paciente` ou `ProfissionalSaude`, primeiro e necessario entrar como administrador e preparar o cadastro dessa pessoa.

Fluxo recomendado pela interface web:

1. Acesse `/pages/login.html` usando o usuario administrador inicial.
2. Na Home, cadastre uma nova pessoa com nome, CPF, data de nascimento, endereco e telefone.
3. Busque ou selecione essa pessoa na area de atualizacao de cadastro.
4. No campo de perfil complementar, escolha `Paciente` ou `Profissional de Saude`.
5. Preencha os dados especificos do perfil escolhido e salve.
6. Ainda com a mesma pessoa selecionada, cadastre o usuario com email, senha e o mesmo perfil correspondente.
7. Saia da conta admin.
8. Entre novamente na tela de login usando o email e senha cadastrados para essa pessoa.

Esse fluxo e necessario porque o sistema separa o cadastro da pessoa, o perfil assistencial e o usuario de acesso. Assim, um login de paciente precisa estar vinculado a uma pessoa que tambem possui cadastro de paciente, e um login de profissional precisa estar vinculado a uma pessoa que tambem possui cadastro de profissional de saude.

## Testando pela propria interface

A aplicacao pode ser testada pela propria interface web, sem precisar de outro sistema cliente.

### 1. Entrar na tela de login

Acesse:

```txt
https://localhost:<porta>/pages/login.html
```

Use o usuario inicial:

```txt
Email: admin@sghss.com
Senha: Admin@123
```

Apos o login, a aplicacao redireciona para a tela principal:

```txt
/pages/home.html
```

### 2. Criar uma pessoa pela tela principal

Na tela principal, use o formulario de cadastro de pessoa.

Informe os dados basicos, como nome, CPF, data de nascimento, endereco e telefone.

Depois de salvar, busque ou selecione a pessoa cadastrada na propria tela.

### 3. Criar um usuario pela tela principal

Com a pessoa selecionada, escolha o perfil complementar de usuario, informe email, senha e perfil, e salve.

Perfis disponiveis:

```txt
1 = Admin
2 = ProfissionalSaude
3 = Paciente
```

Para criar usuario com perfil `Paciente`, primeiro cadastre o perfil de paciente para a pessoa.

Para criar usuario com perfil `ProfissionalSaude`, primeiro cadastre o perfil de profissional para a pessoa.

Depois disso, crie o usuario usando o mesmo cadastro de pessoa e o perfil correspondente.

## Testando pelo Swagger

Tambem e possivel testar diretamente pelo Swagger.

### 1. Fazer login

No Swagger, acesse:

```txt
POST /api/Auth/login
```

Use o usuario inicial:

```json
{
  "email": "admin@sghss.com",
  "senha": "Admin@123"
}
```

A resposta retorna um campo `token`.

### 2. Autorizar no Swagger

Clique no botao `Authorize` no topo do Swagger e cole o token retornado no login.

Depois disso, os endpoints protegidos ficam liberados para teste.

### 3. Criar uma pessoa

Antes de criar um usuario novo, e necessario criar uma pessoa.

Use:

```txt
POST /api/Pessoas
```

Exemplo:

```json
{
  "nome": "Usuario Teste",
  "cpf": "12345678901",
  "dataNascimento": "1990-01-01T00:00:00",
  "endereco": "Rua Teste, 123",
  "telefone": "11999999999"
}
```

Guarde o `idPessoa` retornado.

### 4. Criar um usuario

Para criar um usuario administrador, use:

```txt
POST /api/Usuarios
```

Exemplo:

```json
{
  "idPessoa": 2,
  "email": "teste@sghss.com",
  "senha": "Teste123",
  "perfil": 1
}
```

Valores de `perfil`:

```txt
1 = Admin
2 = ProfissionalSaude
3 = Paciente
```

Para criar usuario com perfil `Paciente`, primeiro crie a pessoa e depois cadastre o paciente em:

```txt
POST /api/Paciente/pessoa/{idPessoa}
```

Para criar usuario com perfil `ProfissionalSaude`, primeiro crie a pessoa e depois cadastre o profissional em:

```txt
POST /api/Profissional/pessoa/{idPessoa}
```

Depois disso, crie o usuario em `POST /api/Usuarios` usando o mesmo `idPessoa` e o perfil correspondente.

## Comandos uteis

Aplicar migrations manualmente:

```bash
dotnet ef database update --project SGHSS.Api
```

Parar o banco:

```bash
docker compose down
```

Parar e apagar os dados do banco:

```bash
docker compose down -v
```
