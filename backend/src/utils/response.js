/**
 * Standard API response envelope helpers per docs/AGENTS.md §6 and docs/API.md.
 * Standard response shape: { success: boolean, data?: T, message?: string, error?: { code: string, message: string } }
 */

export const successResponse = (res, data = null, messageOrStatus = 200, maybeStatus = 200) => {
  let statusCode = 200;
  let message;

  if (typeof messageOrStatus === 'number') {
    statusCode = messageOrStatus;
  } else if (typeof messageOrStatus === 'string') {
    message = messageOrStatus;
    if (typeof maybeStatus === 'number') {
      statusCode = maybeStatus;
    }
  }

  const payload = {
    success: true,
    data
  };

  if (message) {
    payload.message = message;
  }

  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message = 'Internal Server Error', code = 'INTERNAL_ERROR', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
};
