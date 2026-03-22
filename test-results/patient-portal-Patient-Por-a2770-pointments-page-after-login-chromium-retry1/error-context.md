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
      - generic [ref=e16]: Invalid email or password. Please try again.
      - generic [ref=e17]:
        - generic [ref=e18]: Email address
        - generic [ref=e19]:
          - img [ref=e20]
          - textbox "you@example.com" [ref=e23]: robert.johnson@email.com
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]: Password
          - button "Forgot password?" [ref=e27] [cursor=pointer]
        - generic [ref=e28]:
          - img [ref=e29]
          - textbox "Enter your password" [ref=e32]: password123
          - button [ref=e33] [cursor=pointer]:
            - img [ref=e34]
      - button "Sign In" [ref=e37] [cursor=pointer]
    - paragraph [ref=e39]:
      - text: New patient?
      - button "Register here" [ref=e40] [cursor=pointer]
  - paragraph [ref=e41]: "Demo: Pre-filled as Robert Johnson / password123 — click Sign In to continue"
```