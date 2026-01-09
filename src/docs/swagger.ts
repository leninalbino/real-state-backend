import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate API',
      version: '1.0.0',
      description: 'API para el portal inmobiliario',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Registrar usuario',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'fullName'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    fullName: { type: 'string' },
                    phone: { type: 'string' },
                    role: { type: 'string', enum: ['buyer', 'agent', 'admin'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Usuario creado' },
            '400': { description: 'Datos inválidos' },
          },
          security: [],
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login exitoso' },
            '401': { description: 'Credenciales inválidas' },
          },
          security: [],
        },
      },
      '/api/auth/forgot-password': {
        post: {
          summary: 'Solicitar recuperación de contraseña',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Solicitud enviada' },
          },
          security: [],
        },
      },
      '/api/auth/reset-password': {
        post: {
          summary: 'Restablecer contraseña',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'newPassword'],
                  properties: {
                    token: { type: 'string' },
                    newPassword: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Contraseña actualizada' },
            '400': { description: 'Token inválido' },
          },
          security: [],
        },
      },
      '/api/auth/change-password': {
        post: {
          summary: 'Cambiar contraseña',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Contraseña actualizada' },
            '401': { description: 'Credenciales inválidas' },
          },
        },
      },
      '/api/properties': {
        get: {
          summary: 'Listar propiedades',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'location', in: 'query', schema: { type: 'string' } },
            { name: 'bedrooms', in: 'query', schema: { type: 'number' } },
            { name: 'bathrooms', in: 'query', schema: { type: 'number' } },
            { name: 'areaMin', in: 'query', schema: { type: 'number' } },
            { name: 'areaMax', in: 'query', schema: { type: 'number' } },
            { name: 'amenities', in: 'query', schema: { type: 'string' } },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'number' },
              description: 'Pagina actual (min 1).',
            },
            {
              name: 'pageSize',
              in: 'query',
              schema: { type: 'number' },
              description: 'Cantidad por pagina (min 1, max 50).',
            },
          ],
          responses: { '200': { description: 'OK' } },
          security: [],
        },
        post: {
          summary: 'Crear propiedad',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'title',
                    'price',
                    'currency',
                    'location',
                    'bedrooms',
                    'bathrooms',
                    'area',
                    'type',
                    'status',
                    'description',
                  ],
                },
              },
            },
          },
          responses: { '201': { description: 'Creada' } },
        },
      },
      '/api/properties/{id}': {
        get: {
          summary: 'Detalle de propiedad',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'OK' }, '404': { description: 'No encontrada' } },
          security: [],
        },
      },
      '/api/filters/property-types': {
        get: {
          summary: 'Tipos de propiedad',
          responses: { '200': { description: 'OK' } },
          security: [],
        },
      },
      '/api/filters/property-characteristics': {
        get: {
          summary: 'Características de propiedad',
          responses: { '200': { description: 'OK' } },
          security: [],
        },
      },
      '/api/hero-slides': {
        get: {
          summary: 'Slides del hero',
          responses: { '200': { description: 'OK' } },
          security: [],
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options as unknown) as Record<
  string,
  unknown
>;
