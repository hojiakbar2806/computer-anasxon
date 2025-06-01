from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str
    SECRET_KEY: str

    EMAIL_HOST_USER: str = ""
    EMAIL_HOST_PASS: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
