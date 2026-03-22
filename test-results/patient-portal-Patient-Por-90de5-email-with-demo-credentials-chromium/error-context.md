# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "Primus Health" [level=1] [ref=e10]
    - paragraph [ref=e11]: Patient Portal
  - generic [ref=e12]:
    - heading "Welcome back" [level=2] [ref=e13]
    - paragraph [ref=e14]: Sign in to access your health records and care team
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: Email address
        - generic [ref=e18]:
          - img [ref=e19]
          - textbox "you@example.com" [ref=e22]: robert.johnson@email.com
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]: Password
          - button "Forgot password?" [ref=e26] [cursor=pointer]
        - generic [ref=e27]:
          - img [ref=e28]
          - textbox "Enter your password" [ref=e31]: password123
          - button [ref=e32] [cursor=pointer]:
            - img [ref=e33]
      - button "Sign In" [ref=e36] [cursor=pointer]
    - paragraph [ref=e38]:
      - text: New patient?
      - button "Register here" [ref=e39] [cursor=pointer]
  - paragraph [ref=e40]: "Demo: Pre-filled as Robert Johnson / password123 — click Sign In to continue"
```