# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report them privately through GitHub's
[private vulnerability reporting](https://github.com/DanielDiazLajara/ccss-assessment/security/advisories/new)
(Security tab → "Report a vulnerability"). Include steps to reproduce and the browser you used.
You should receive an answer within a few days.

## Scope

This is a static, client-side application: there is no backend and assessment data never leaves the
browser. Relevant issues include, for example:

- Script injection (XSS) through assessment content, imported JSON files or share links.
- Data leaking to third parties.
- Vulnerable versions of the libraries in `vendor/`.

## Handling assessment data

Assessment results describe an organization's security gaps. Keep in mind that:

- Share links (`#share=` / `#edit=`) embed the full assessment in the URL. Anyone with the link can read it.
- The assessment is stored in the browser's `localStorage`. Use "Restart assessment" or clear site data on shared computers.

---

## Política de seguridad (ES)

Por favor, **no abras una issue pública** para problemas de seguridad. Repórtalos de forma privada mediante el
[reporte privado de vulnerabilidades](https://github.com/DanielDiazLajara/ccss-assessment/security/advisories/new)
de GitHub (pestaña Security → "Report a vulnerability"), indicando los pasos para reproducirlo y el navegador utilizado.

Los enlaces para compartir contienen la evaluación completa y la evaluación se guarda en el `localStorage` del
navegador: trátalos como información confidencial.
