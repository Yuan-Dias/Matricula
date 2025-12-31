# 🎓 Sistema de Gestão de Matrículas (MatriculaAPI)

Sistema para gerenciamento de instituições de ensino, permitindo o controle centralizado de usuários (Administradores, Professores e Alunos), cursos, matérias, matrículas e lançamento de notas.

## 🚀 Tecnologias Utilizadas

### **Backend**
* **Java 17**
* **Spring Boot 3**
* **Spring Security** (Autenticação e Autorização via JWT)
* **Spring Data JPA** (Persistência de dados e abstração de consultas)
* **H2 Database** (Banco de dados em memória para desenvolvimento ágil)
* **Auth0 JWT** (Geração e validação de tokens de segurança)
* **Maven** (Gerenciador de dependências e build)

### **Frontend**
* **HTML5 / CSS3**
* **JavaScript (ES6+)**
* **Fetch API** (Comunicação assíncrona com o backend)
* **FontAwesome** (Biblioteca de ícones)

---

## 🛠️ Arquitetura do Sistema

O projeto utiliza a arquitetura de **API RESTful**, separando completamente as responsabilidades entre o cliente (Frontend) e o servidor (Backend).



* **Model**: Entidades mapeadas para o banco de dados.
* **Repository**: Interfaces para operações CRUD.
* **Service**: Lógica de negócio e serviços de segurança (JWT).
* **Controller**: Exposição dos endpoints da API.
* **DTO (Data Transfer Object)**: Objetos para transferência de dados otimizada e segura.

---

## 🔐 Níveis de Acesso (Roles)

O sistema utiliza **RBAC (Role-Based Access Control)** para proteger as rotas:

1.  **INSTITUICAO (ADMIN)**:
    * Acesso total ao sistema.
    * Criação de usuários, cursos e matérias.
    * Exclusão e edição de registros.
2.  **PROFESSOR**:
    * Visualiza as matérias que leciona.
    * Lança notas para alunos matriculados em suas turmas.
3.  **ALUNO**:
    * Visualiza suas próprias notas e histórico de matrículas.
    * Realiza auto-matrícula (se permitido pela configuração).

---

## 📋 Como Executar o Projeto

### **1. Backend**
1. Importe o projeto em sua IDE (IntelliJ, Eclipse ou VS Code).
2. Certifique-se de que o Java 17 está configurado.
3. No arquivo `src/main/resources/application.properties`, defina o segredo do JWT:
   ```properties
   api.security.token.secret=matricula2025
4. No mesmo arquivo do item anterior, substitua a senha no trecho "spring.datasource.password=" pela sua senha configurada no MySQL, se não tiver senha, apague a existente e deixe em branco"