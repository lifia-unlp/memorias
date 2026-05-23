from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel


@dataclass(frozen=True)
class SessionId:
    value: str


class Message(BaseModel):
    model_config = {"frozen": True}
    role: Literal["system", "user", "assistant", "tool"]
    content: str


class ChatRequest(BaseModel):
    model_config = {"frozen": True}
    messages: list[Message]


class Member(BaseModel):
    model_config = {"frozen": True}
    id: str
    firstName: str
    lastName: str
    slug: str
    startDate: date | None = None
    endDate: date | None = None
    highestDegree: str | None = None
    coursesAtUNLP: str | None = None
    positionAtLab: str | None = None
    positionAtUnlp: str | None = None
    category: str | None = None
    sicadiCategory: str | None = None
    positionAtCIC: str | None = None
    positionAtCONICET: str | None = None
    personalEmail: str | None = None
    institutionalEmail: str | None = None
    phone: str | None = None
    webPage: str | None = None
    orcid: str | None = None
    dblpProfile: str | None = None
    googleResearchProfile: str | None = None
    researchGateProfile: str | None = None
    shortCvInSpanish: str | None = None
    shortCvInEnglish: str | None = None
    interestsInEnglish: str | None = None
    interestsInSpanish: str | None = None
    affiliations: str | None = None
    notes: str | None = None
    avatarUrl: str | None = None
    tags: list[str] = []
    createdAt: datetime
    updatedAt: datetime


class Project(BaseModel):
    model_config = {"frozen": True}
    id: str
    title: str
    code: str | None = None
    slug: str
    startDate: date | None = None
    endDate: date | None = None
    director: str | None = None
    coDirector: str | None = None
    responsibleGroup: str | None = None
    fundingAgency: str | None = None
    amount: str | None = None
    summary: str | None = None
    website: str | None = None
    tags: list[str] = []
    featured: bool = False
    createdAt: datetime
    updatedAt: datetime


class Thesis(BaseModel):
    model_config = {"frozen": True}
    id: str
    title: str
    slug: str
    career: str | None = None
    level: str | None = None
    student: str | None = None
    director: str | None = None
    coDirector: str | None = None
    otherAdvisors: str | None = None
    startDate: date | None = None
    endDate: date | None = None
    summary: str | None = None
    reportUrl: str | None = None
    progress: int | None = None
    keywords: str | None = None
    website: str | None = None
    tags: list[str] = []
    featured: bool = False
    createdAt: datetime
    updatedAt: datetime


class Scholarship(BaseModel):
    model_config = {"frozen": True}
    id: str
    title: str
    slug: str
    type: str | None = None
    student: str | None = None
    director: str | None = None
    coDirector: str | None = None
    fundingAgency: str | None = None
    startDate: date | None = None
    endDate: date | None = None
    summary: str | None = None
    tags: list[str] = []
    createdAt: datetime
    updatedAt: datetime


class Publication(BaseModel):
    model_config = {"frozen": True}
    id: str
    slug: str
    type: str
    title: str
    authors: str
    year: int
    ranking: str | None = None
    selfArchivingUrl: str | None = None
    bibtexData: Any  # JSON field representing BibTex data
    tags: list[str] = []
    featured: bool = False
    createdAt: datetime
    updatedAt: datetime
