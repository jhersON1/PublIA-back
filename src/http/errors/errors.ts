// Errores estándar para las llamadas HTTP salientes.

export class HttpErrorBase extends Error {
  name = 'HttpErrorBase';
  constructor(message: string) {
    super(message);
  }
}

export class HttpTimeoutError extends HttpErrorBase {
  name = 'HttpTimeoutError';
  constructor(public url: string, public timeoutMs: number) {
    super(`Request timeout after ${timeoutMs}ms: ${url}`);
  }
}

export class HttpRequestError extends HttpErrorBase {
  name = 'HttpRequestError';
  constructor(
    public status: number,
    public statusText: string,
    public url: string,
    public method: string,
    public body?: any,
  ) {
    super(`HTTP ${status} ${statusText}`);
  }
}

export class HttpParseError extends HttpErrorBase {
  name = 'HttpParseError';
  constructor(public url: string, public method: string, public raw: string) {
    super(`Failed to parse response as JSON: ${url}`);
  }
}

