# 🕒 Atropos — Organize seu tempo, domine seus hábitos.

O **Atropos** é uma plataforma web desenvolvida como **Trabalho de Conclusão de Curso (TCC)** do curso técnico em **Desenvolvimento de Sistemas da ETEC**, com o objetivo de **ajudar estudantes a organizarem o tempo de forma inteligente e motivadora**.

A aplicação combina **gestão de tarefas**, **pontuação por produtividade** e uma **ofensiva diária**, incentivando o foco e a disciplina por meio de pequenas recompensas visuais e gamificação.

---

## 🚀 Funcionalidades principais

- 📅 **Calendário interativo** — visualize e organize suas tarefas por data.  
- ✅ **Lista de tarefas com status dinâmico** — adicione, conclua e edite tarefas facilmente.  
- 🏆 **Sistema de pontos e troféus** — cada tarefa concluída soma pontos; atingir metas libera troféus virtuais.  
- ⚔️ **Ofensiva diária** — modo especial que desafia o usuário a completar tarefas antes do prazo.  
- 🔔 **Lembretes automáticos** — envio de e-mails automáticos antes da data limite.  
- 💾 **Login com persistência local** — autenticação via `localStorage` para acesso rápido sem recarregar sessão.  
- 🧭 **Design focado na simplicidade e eficiência**, priorizando leveza e compatibilidade com dispositivos modestos.

---

## 🧱 Tecnologias utilizadas

**Front-end:**  
- HTML5  
- CSS3  
- JavaScript (fetch API para requisições assíncronas)  

**Back-end:**  
- PHP (API própria e modularizada)  
- MySQL (armazenamento de dados)

**Infraestrutura:**  
- Hospedagem em servidor remoto  
- Separação clara entre front-end e API  
- Foco em segurança e estabilidade das requisições

---

## ⚙️ Arquitetura geral

O projeto é dividido em três camadas principais:

1. **Interface do usuário (Front-end)** — páginas HTML e scripts JavaScript responsáveis pela interação e exibição dinâmica das informações.  
2. **Camada de aplicação (PHP)** — responsável pelas regras de negócio, controle de tarefas e autenticação.  
3. **Camada de dados (MySQL)** — armazena usuários, tarefas, pontuações e informações de progresso.

Toda a comunicação entre front-end e back-end é feita por meio de **requisições `fetch()`** seguras, utilizando o padrão **JSON** para envio e recebimento de dados.

---

## 💡 Propósito do projeto

O Atropos nasceu da ideia de **transformar a rotina estudantil em um jogo de autogestão** — onde o aluno não apenas cumpre tarefas, mas **aprende a valorizar o tempo** e reconhecer o próprio progresso.

Mais do que um gerenciador de tarefas, o Atropos é um **incentivador de hábitos produtivos**.  
Foi projetado para ser leve, acessível e inspirador, mesmo em dispositivos de baixo desempenho.

---

## 👩‍💻 Desenvolvido por

**Kubito Leo**  
Técnico em Desenvolvimento de Sistemas — ETEC  
2025

---

## 💬 Para futuros desenvolvedores

Este repositório foi feito pensando também em **alunos curiosos dos próximos anos**.  
Explore a estrutura, entenda os fluxos, experimente ideias novas — mas sempre com responsabilidade e ética.  

> “O tempo é o verdadeiro chefe do projeto. O Atropos só te ajuda a ouvi-lo melhor.”

---
