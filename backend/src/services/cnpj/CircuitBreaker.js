/**
 * Circuit Breaker Pattern
 *
 * Previne chamadas consecutivas a APIs que estão falhando.
 * Estados: CLOSED (normal) → OPEN (falhas) → HALF-OPEN (teste)
 */

class CircuitBreaker {
  constructor({ threshold = 5, timeout = 60000 }) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.lastFailure = 0;
    this.state = 'CLOSED';
  }

  isOpen() {
    if (this.state === 'CLOSED') return false;
    if (Date.now() - this.lastFailure >= this.timeout) {
      this.state = 'HALF-OPEN';
      console.log(`[CircuitBreaker] Tentando novamente (HALF-OPEN)`);
      return false;
    }
    return true;
  }

  recordSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.log(`[CircuitBreaker] Circuito ABERTO (${this.failures} falhas)`);
    }
  }

  reset() {
    this.failures = 0;
    this.lastFailure = 0;
    this.state = 'CLOSED';
  }

  getStats() {
    return { state: this.state, failures: this.failures, threshold: this.threshold, timeout: this.timeout };
  }
}

module.exports = { CircuitBreaker };
