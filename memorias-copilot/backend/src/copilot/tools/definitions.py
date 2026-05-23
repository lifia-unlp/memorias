from typing import Any, Final

# OpenAI completions tools schema definitions
TOOLS: Final[list[dict[str, Any]]] = [
    # --- Search Tools ---
    {
        "type": "function",
        "function": {
            "name": "search_members",
            "description": "Search for research group members by name, slug, position, bio, or research interests.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search keyword (e.g. member name, role, research interest, position like POSTDOC or ADMIN)",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_projects",
            "description": "Search for research projects by title, code, summary, or slug.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search keyword (e.g. project title, code, agency like CONICET or CIC, status)",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_theses",
            "description": "Search for academic theses by title, student name, director name, career, or summary.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search keyword (e.g. thesis title, student name, director, career)",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_scholarships",
            "description": "Search for scholarships by title, type, student name, director, or funding agency.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search keyword (e.g. scholarship title, student, agency, type)",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_publications",
            "description": "Search for publications by title, authors list, year, type, or ranking.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search keyword (e.g. publication title, author, year, bibtex type)",
                    }
                },
                "required": ["query"],
            },
        },
    },
    # --- Detail Retrieval Tools ---
    {
        "type": "function",
        "function": {
            "name": "get_member_by_id_or_slug",
            "description": "Retrieve full detailed information of a specific research group member by their UUID or unique slug.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_or_slug": {
                        "type": "string",
                        "description": "The member's UUID string or unique slug (e.g. 'dr-jane-doe')",
                    }
                },
                "required": ["id_or_slug"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_by_id_or_slug",
            "description": "Retrieve full detailed information of a specific project by its UUID or unique slug.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_or_slug": {
                        "type": "string",
                        "description": "The project's UUID string or unique slug",
                    }
                },
                "required": ["id_or_slug"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_thesis_by_id_or_slug",
            "description": "Retrieve full detailed information of an academic thesis by its UUID or unique slug.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_or_slug": {
                        "type": "string",
                        "description": "The thesis's UUID string or unique slug",
                    }
                },
                "required": ["id_or_slug"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_scholarship_by_id_or_slug",
            "description": "Retrieve full detailed information of a scholarship by its UUID or unique slug.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_or_slug": {
                        "type": "string",
                        "description": "The scholarship's UUID string or unique slug",
                    }
                },
                "required": ["id_or_slug"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_publication_by_id_or_slug",
            "description": "Retrieve full detailed information of a publication (including original Bibtex JSON metadata) by its UUID or unique slug.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_or_slug": {
                        "type": "string",
                        "description": "The publication's UUID string or unique slug",
                    }
                },
                "required": ["id_or_slug"],
            },
        },
    },
    # --- Relationship Traversal Tools ---
    {
        "type": "function",
        "function": {
            "name": "get_project_members",
            "description": "Get all research group members associated with a specific project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "The project's UUID id string",
                    }
                },
                "required": ["project_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_member_projects",
            "description": "Get all research projects associated with a specific member.",
            "parameters": {
                "type": "object",
                "properties": {
                    "member_id": {
                        "type": "string",
                        "description": "The member's UUID id string",
                    }
                },
                "required": ["member_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_member_publications",
            "description": "Get all publications written by a specific member.",
            "parameters": {
                "type": "object",
                "properties": {
                    "member_id": {
                        "type": "string",
                        "description": "The member's UUID id string",
                    }
                },
                "required": ["member_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_member_theses",
            "description": "Get all academic theses associated with a specific member (either as student or director).",
            "parameters": {
                "type": "object",
                "properties": {
                    "member_id": {
                        "type": "string",
                        "description": "The member's UUID id string",
                    }
                },
                "required": ["member_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_member_scholarships",
            "description": "Get all scholarships associated with a specific member.",
            "parameters": {
                "type": "object",
                "properties": {
                    "member_id": {
                        "type": "string",
                        "description": "The member's UUID id string",
                    }
                },
                "required": ["member_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_publications",
            "description": "Get all publications produced by a specific project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "The project's UUID id string",
                    }
                },
                "required": ["project_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_thesis_publications",
            "description": "Get all publications produced or cited by a specific thesis.",
            "parameters": {
                "type": "object",
                "properties": {
                    "thesis_id": {
                        "type": "string",
                        "description": "The thesis's UUID id string",
                    }
                },
                "required": ["thesis_id"],
            },
        },
    },
]
