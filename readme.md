# 🎓 Sistema de Gestão Acadêmica — MatriculaAPI

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

Backend para gerenciamento acadêmico com autenticação segura, controle de acesso por papéis (RBAC) e modelagem relacional otimizada.

---

## 📌 Sumário
- [📖 Sobre o Projeto](#-sobre-o-projeto)
- [⚙️ Funcionalidades](#️-funcionalidades)
- [🧱 Arquitetura](#-arquitetura)
- [🛠 Stack Tecnológica](#-stack-tecnológica)
- [🚀 Como Executar](#-como-executar)
- [🔐 Segurança](#-segurança)
- [📡 Endpoints Principais](#-endpoints-principais)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [📈 Roadmap](#-roadmap)
- [👨‍💻 Autor](#-autor)

---

## 📖 Sobre o Projeto

O **MatriculaAPI** é um backend REST desenvolvido para centralizar a gestão acadêmica de instituições de ensino.

O sistema permite controle completo de:

- Usuários (Admin, Professor, Aluno)
- Cursos e Disciplinas
- Matrículas
- Lançamento de Notas

O foco principal foi criar uma base **segura, escalável e manutenível**, seguindo boas práticas de arquitetura em camadas.

---

## ⚙️ Funcionalidades

✅ Autenticação com JWT  
✅ Criptografia de senhas com BCrypt  
✅ Controle de acesso baseado em papéis (RBAC)  
✅ CRUD completo de entidades acadêmicas  
✅ Validações de regras de negócio  
✅ Integração com banco relacional  

---

## 🧱 Arquitetura

Arquitetura em camadas para desacoplamento e organização:

| Camada | Responsabilidade |
|---|---|
| Controller | Endpoints REST |
| Service | Regras de negócio |
| Repository | Acesso ao banco |
| Entity | Modelagem ORM |
| DTO | Transferência segura de dados |

---

## 🛠 Stack Tecnológica

### Backend
- Java 17
- Spring Boot 3
- Spring Security
- JWT (Auth0)
- Spring Data JPA / Hibernate
- Maven

### Banco de Dados
- MySQL (Produção)
- H2 (Testes)

### Frontend Cliente
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API

---

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone [https://github.com/Yuan-Dias/Matricula.git](https://github.com/Yuan-Dias/Matricula.git)
   cd Matricula

2. **Configuração do Banco de Dados**

* Navegue até src/main/resources/application.properties e configure suas credenciais do MySQL e a chave secreta do JWT:

# Configuração do Banco de Dados
spring.datasource.url=jdbc:mysql://localhost:3306/matricula_db
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha

# Configuração JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Segurança JWT
api.security.token.secret=${JWT_SECRET:matricula2025}

3. **Compilar e Executar**
mvn clean install
mvn spring-boot:run

4. **Documentação da API**

Exemplo dos principais endpoints disponíveis:

| Método	| Endpoint | Descrição	| Acesso |
| :--- | :--- | :--- | :--- |
| POST | /auth/login |	Autenticação de usuários |	Público |
| POST |	/auth/register |	Registro de novos usuários |	Instituição |
| GET |	/cursos |	Listagem de cursos |	Autenticado |
| POST | /notas |	Lançamento de notas |	Professor |
| POST |	/matriculas |	Realizar matrícula |	Instituição/Aluno |

###  Autor

* 🔗 GitHub: https://github.com/Yuan-Dias
* 🔗 LinkedIn: https://linkedin.com/in/yuan-barbosa-dias-3433802a5
