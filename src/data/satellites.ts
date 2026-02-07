import { Satellite, SatelliteMetrics, EmailResponse } from "@/types/satellite";

export const initialSatellites: Satellite[] = [
  {
    id: "1",
    alias: "01 - rodrigomeirelesgoncalves",
    sheetId: "1V2ywFAezKhMjYAYGb7Lem48I1fshgSUhYnE6m95Y_1I",
    webUrl: "https://docs.google.com/spreadsheets/d/1V2ywFAezKhMjYAYGb7Lem48I1fshgSUhYnE6m95Y_1I",
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    alias: "02 - blackscalem",
    sheetId: "1TZd2IcwcDLx56R0YoEUv_1r49xrvBbA6wHdOmwut-OM",
    webUrl: "https://docs.google.com/spreadsheets/d/1TZd2IcwcDLx56R0YoEUv_1r49xrvBbA6wHdOmwut-OM",
    isActive: true,
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "3",
    alias: "03 - gestor",
    sheetId: "16xKq8OMmAy7LI8tqDGmdBxwdZm2aG5ehfdcoav3w4BQ",
    webUrl: "https://docs.google.com/spreadsheets/d/16xKq8OMmAy7LI8tqDGmdBxwdZm2aG5ehfdcoav3w4BQ",
    isActive: true,
    createdAt: new Date("2024-01-17"),
  },
  {
    id: "4",
    alias: "04 - rodrigoblackscale",
    sheetId: "1icYdr2eAXV7I6OFL5y_Gs_q8kSzza3UMfya6tpDHKeg",
    webUrl: "https://docs.google.com/spreadsheets/d/1icYdr2eAXV7I6OFL5y_Gs_q8kSzza3UMfya6tpDHKeg",
    isActive: true,
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "5",
    alias: "05 - gestaorodrigo0",
    sheetId: "1gbmMesrNS-7SB06K1ALTyO6C5eQeHWxaE9CwvH86Nb8",
    webUrl: "https://docs.google.com/spreadsheets/d/1gbmMesrNS-7SB06K1ALTyO6C5eQeHWxaE9CwvH86Nb8",
    isActive: true,
    createdAt: new Date("2024-01-19"),
  },
  {
    id: "6",
    alias: "06 - consultoria",
    sheetId: "1iD2x4njwoZTnZkrHGFQysAPt8JwtYpCulZE8wn6aPWk",
    webUrl: "https://docs.google.com/spreadsheets/d/1iD2x4njwoZTnZkrHGFQysAPt8JwtYpCulZE8wn6aPWk",
    isActive: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "7",
    alias: "07 - parcerias",
    sheetId: "1bxyuLJsUALKHjjh_XyY4qn-SijjfuzahvqGs2Jep6GU",
    webUrl: "https://docs.google.com/spreadsheets/d/1bxyuLJsUALKHjjh_XyY4qn-SijjfuzahvqGs2Jep6GU",
    isActive: true,
    createdAt: new Date("2024-01-21"),
  },
  {
    id: "8",
    alias: "08 - vendas",
    sheetId: "1GppIgnABR26ymnT6Z1impFsd3CbbAHRq6EQNsS27to8",
    webUrl: "https://docs.google.com/spreadsheets/d/1GppIgnABR26ymnT6Z1impFsd3CbbAHRq6EQNsS27to8",
    isActive: true,
    createdAt: new Date("2024-01-22"),
  },
  {
    id: "9",
    alias: "09 - negocios.bs",
    sheetId: "1RBSoq3H0AanH2PpVghi6KNR8o6Rb-CmjqhdZbf5vf6o",
    webUrl: "https://docs.google.com/spreadsheets/d/1RBSoq3H0AanH2PpVghi6KNR8o6Rb-CmjqhdZbf5vf6o",
    isActive: true,
    createdAt: new Date("2024-01-23"),
  },
  {
    id: "10",
    alias: "10 - consultoria1",
    sheetId: "1rSBDJhmUqr4P-dBUq14ZHZvPuSqDZXp332gf7BORFNE",
    webUrl: "https://script.google.com/macros/s/AKfycbzHDWqR9iSpZmmZsHrRFXf-TejWqvYdX8KKR6WneLZL3UpxNAIOPxqWOeHDQtP2hBDQ/exec",
    isActive: true,
    createdAt: new Date("2024-01-24"),
  },
  {
    id: "11",
    alias: "11 - amazonvendas",
    sheetId: "1TC3IGA4bKr1K8VDstJ2gmTmLHVdLCPPzGjRnebRv9P8",
    webUrl: "https://script.google.com/macros/s/AKfycbxqwXApP5qQ2I7MzyAoewr9RIOH1sw97fViS6VoqLXrr11m5S_sIMNBXbzZRxrJYAR8/exec",
    isActive: true,
    createdAt: new Date("2024-01-25"),
  },
];

// Simulated metrics - in production this would come from the actual sheets
export const generateMockMetrics = (satellites: Satellite[]): SatelliteMetrics[] => {
  return satellites.map((sat) => ({
    satelliteId: sat.id,
    satelliteAlias: sat.alias,
    sent: Math.floor(Math.random() * 500) + 100,
    opened: Math.floor(Math.random() * 300) + 50,
    replied: Math.floor(Math.random() * 50) + 5,
    bounced: Math.floor(Math.random() * 30) + 2,
    failed: Math.floor(Math.random() * 20) + 1,
    optOut: Math.floor(Math.random() * 15),
    lastUpdated: new Date(),
  }));
};

export const generateMockResponses = (): EmailResponse[] => {
  const responses: EmailResponse[] = [
    {
      id: "1",
      senderEmail: "vendas@blackscale.com.br",
      recipientEmail: "joao.silva@empresa.com",
      responseContent: "Olá, tenho interesse em saber mais sobre os serviços. Podemos agendar uma call?",
      receivedAt: new Date(Date.now() - 1000 * 60 * 30),
      satelliteAlias: "02 - blackscalem",
    },
    {
      id: "2",
      senderEmail: "rodrigo@gestao.com",
      recipientEmail: "maria.santos@startup.io",
      responseContent: "Muito obrigado pelo contato! Estou avaliando as propostas e retorno em breve.",
      receivedAt: new Date(Date.now() - 1000 * 60 * 45),
      satelliteAlias: "03 - gestor",
    },
    {
      id: "3",
      senderEmail: "parcerias@blackscale.com.br",
      recipientEmail: "carlos.oliveira@tech.com",
      responseContent: "Interessante! Quais são os próximos passos para fecharmos a parceria?",
      receivedAt: new Date(Date.now() - 1000 * 60 * 60),
      satelliteAlias: "07 - parcerias",
    },
    {
      id: "4",
      senderEmail: "consultoria@empresa.com",
      recipientEmail: "ana.costa@negocio.com.br",
      responseContent: "Podemos marcar uma reunião para esta semana? Tenho algumas dúvidas.",
      receivedAt: new Date(Date.now() - 1000 * 60 * 90),
      satelliteAlias: "06 - consultoria",
    },
    {
      id: "5",
      senderEmail: "vendas@amazon.com.br",
      recipientEmail: "pedro.lima@loja.com",
      responseContent: "Gostaria de receber mais informações sobre preços e condições de pagamento.",
      receivedAt: new Date(Date.now() - 1000 * 60 * 120),
      satelliteAlias: "11 - amazonvendas",
    },
  ];
  return responses;
};
