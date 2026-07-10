  # app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# Toggle: if False, registration/login/profile-update skip all email
# verification logic entirely and behave like before this feature existed.
EMAIL_VERIFICATION_REQUIRED = os.getenv("EMAIL_VERIFICATION_REQUIRED", "true").strip().lower() == "true"