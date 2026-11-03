export abstract class DomainError extends Error {
  public readonly errorName: string;
  public readonly code: string;
  public readonly details?: string[] | undefined;

  constructor(message: string, code: string, details?: string[]) {
    super(message);

    this.code = code;
    this.details = details;

    this.errorName = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  constructor(details: string[]) {
    super('Falha na validação dos dados fornecidos.', 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} com identificador '${id}' não foi encontrado.`, 'NOT_FOUND');
  }
}
