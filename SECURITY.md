# Security Policy

_Last updated: May 2026_

## Reporting a Vulnerability

> **Please do not report security vulnerabilities through public issues, discussions, or pull requests.**

If you believe you've found a vulnerability, please use [GitHub private vulnerability reporting](https://github.com/Prometheus-X-association/dataspace-connector/security/advisories/new) for coordinated disclosure.

Include as much of the following as possible:

- Type of issue (e.g. buffer overflow, SQL injection, XSS)
- Affected version(s) and location of the affected source code (tag/branch/commit or URL)
- Full paths of source files related to the issue
- Step-by-step instructions to reproduce the issue
- Configuration required to reproduce the issue
- Impact of the issue, including how an attacker might exploit it
- Proof-of-concept or exploit code (if possible)
- Log files related to the issue (if possible)

## Response SLA

| Milestone | Target |
|---|---|
| Acknowledgement | 2 business days |
| Triage & severity rating | 7 days |
| Fix/mitigation - Critical | 30 days |
| Fix/mitigation - High/Medium | 90 days |

If we need more time, we will notify you and agree on an extended timeline before any public disclosure.

## Disclosure Policy

We follow a coordinated disclosure model. Please allow us to complete triage and release a fix before any public disclosure. We will coordinate a disclosure date with you once a fix is ready, typically within 90 days of the initial report.

## Scope

**In scope:**
- Source code in this repository
- Published releases and packages
- Official documentation referencing security-relevant behavior

**Out of scope:**
- Vulnerabilities in third-party dependencies (please report those upstream)
- Issues in forks or unofficial distributions
- Social engineering, phishing, or physical attacks
- Denial-of-service attacks

## Acknowledgements

We appreciate responsible disclosure. Reporters who follow this policy will be acknowledged in the release notes of the fix, unless they prefer to remain anonymous.
