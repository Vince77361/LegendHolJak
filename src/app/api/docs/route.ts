import { NextResponse } from "next/server";

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "홀짝 게임 API",
    description: "홀짝 (Odd/Even) 베팅 게임 API 문서",
    version: "1.0.0",
  },
  servers: [
    {
      url: "/api",
      description: "API Server",
    },
  ],
  paths: {
    "/game/current-round": {
      get: {
        tags: ["Game"],
        summary: "현재 활성 라운드 조회",
        description: "현재 진행 중인 게임 라운드 정보를 반환합니다.",
        responses: {
          "200": {
            description:
              "성공. 활성 라운드가 없으면 data가 null로 반환됩니다.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      nullable: true,
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          format: "uuid",
                          example: "550e8400-e29b-41d4-a716-446655440000",
                        },
                        is_active: { type: "boolean", example: true },
                        created_at: {
                          type: "string",
                          format: "date-time",
                          example: "2026-03-24T00:00:00Z",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "서버 오류",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/game/bet": {
      post: {
        tags: ["Game"],
        summary: "베팅 제출",
        description:
          "현재 활성 라운드에 베팅을 제출합니다. Clerk 인증이 필요합니다.",
        security: [{ clerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["round_id", "bet_amount"],
                properties: {
                  round_id: {
                    type: "string",
                    format: "uuid",
                    description: "베팅할 라운드 ID",
                    example: "550e8400-e29b-41d4-a716-446655440000",
                  },
                  bet_amount: {
                    type: "integer",
                    minimum: 1,
                    description: "베팅 금액 (양수)",
                    example: 10,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "베팅 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        bet_id: {
                          type: "string",
                          format: "uuid",
                          description: "생성된 베팅 ID",
                        },
                        remaining_coins: {
                          type: "integer",
                          description: "베팅 후 남은 코인",
                          example: 90,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "라운드 또는 사용자를 찾을 수 없음",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "400": {
            description: "잘못된 요청 (잔액 부족, 중복 베팅 등)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "인증되지 않은 사용자",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/ranking": {
      get: {
        tags: ["Ranking"],
        summary: "랭킹 조회",
        description: "코인 보유량 기준 내림차순 랭킹을 반환합니다.",
        responses: {
          "200": {
            description: "랭킹 목록",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          username: {
                            type: "string",
                            example: "player1",
                          },
                          coins: { type: "integer", example: 150 },
                          rank: {
                            type: "integer",
                            description: "순위 (1부터 시작)",
                            example: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/create-round": {
      post: {
        tags: ["Admin"],
        summary: "새 라운드 생성",
        description:
          "새 게임 라운드를 생성합니다. Admin 권한이 필요합니다.",
        security: [{ clerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["secret_number"],
                properties: {
                  secret_number: {
                    type: "integer",
                    minimum: 1,
                    maximum: 100,
                    description:
                      "비밀 숫자 (1-100). 홀수면 참여자 WIN, 짝수면 LOSE",
                    example: 42,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "라운드 생성 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        round_id: {
                          type: "string",
                          format: "uuid",
                          description: "생성된 라운드 ID",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "잘못된 요청 (유효하지 않은 숫자, 이미 활성 라운드 존재)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "인증되지 않은 사용자",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "Admin 권한 없음",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/admin/close-round": {
      post: {
        tags: ["Admin"],
        summary: "라운드 종료 + 결과 처리",
        description:
          "활성 라운드를 종료하고 베팅 결과를 처리합니다. secret_number가 홀수면 참여자 WIN(코인 획득), 짝수면 LOSE(코인 차감). Admin 권한이 필요합니다.",
        security: [{ clerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["round_id"],
                properties: {
                  round_id: {
                    type: "string",
                    format: "uuid",
                    description: "종료할 라운드 ID",
                    example: "550e8400-e29b-41d4-a716-446655440000",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "라운드 종료 및 결과 처리 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        winners: {
                          type: "integer",
                          description: "승리한 베팅 수",
                          example: 3,
                        },
                        losers: {
                          type: "integer",
                          description: "패배한 베팅 수",
                          example: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "라운드를 찾을 수 없음",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "400": {
            description: "이미 종료된 라운드 등",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "인증되지 않은 사용자",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "Admin 권한 없음",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Error message" },
        },
      },
    },
    securitySchemes: {
      clerkAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Clerk 인증 토큰",
      },
    },
  },
  tags: [
    { name: "Game", description: "게임 관련 API" },
    { name: "Ranking", description: "랭킹 관련 API" },
    { name: "Admin", description: "관리자 전용 API" },
  ],
};

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
