from fastapi import HTTPException, status

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class DuplicateEntryException(HTTPException):
    def __init__(self, detail: str = "Duplicate entry"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail) # 409 Conflict

class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Operation forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, headers={"WWW-Authenticate": "Bearer"})