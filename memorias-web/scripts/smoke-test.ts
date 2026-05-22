import { spawn } from 'child_process';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const routes = [
  '/',
  '/about',
  '/preferences',
  '/auth/signin',
  '/pending-activation',
  '/members',
  '/projects',
  '/theses',
  '/scholarships',
  '/publications'
];

const errorIndicators = [
  'Application error: a client-side exception has occurred',
  'Unhandled Runtime Error',
  'PrismaClientKnownRequestError',
  'PrismaClientInitializationError',
  'PrismaClientRustPanicError',
  'PrismaClientValidationError',
  'Internal Server Error',
  'Next.js Compiler Error',
  'Failed to compile'
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function isServerReady(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    // Any status code under 500 means the server processed the request (even if redirect or auth check is returned)
    return res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(timeoutMs: number = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerReady()) {
      return true;
    }
    await delay(1000);
  }
  return false;
}

async function runTests() {
  console.log(`Starting Next.js development server on port ${PORT}...`);
  
  const devProcess = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: 'pipe',
    detached: true,
    env: {
      ...process.env,
      PORT: String(PORT)
    }
  });

  let serverOutput = '';
  devProcess.stdout?.on('data', (data) => {
    serverOutput += data.toString();
  });
  devProcess.stderr?.on('data', (data) => {
    serverOutput += data.toString();
  });

  const cleanUp = () => {
    if (devProcess.pid) {
      try {
        process.kill(-devProcess.pid, 'SIGTERM');
      } catch {
        try {
          process.kill(-devProcess.pid, 'SIGKILL');
        } catch {
          // Ignore if already terminated
        }
      }
    }
  };

  process.on('exit', cleanUp);
  process.on('SIGINT', () => {
    cleanUp();
    process.exit(1);
  });
  process.on('SIGTERM', () => {
    cleanUp();
    process.exit(1);
  });

  try {
    console.log('Waiting for Next.js server to start and become ready...');
    const ready = await waitForServer(45000);
    if (!ready) {
      console.error('Next.js server failed to start within the timeout period.');
      console.error('Server output logs:');
      console.error(serverOutput);
      cleanUp();
      process.exit(1);
    }
    
    console.log('Server is ready. Starting HTTP fetch tests on all pages...');
    
    let hasFailure = false;
    const results: { route: string; status: number; text: string; location?: string; pass: boolean }[] = [];

    for (const route of routes) {
      try {
        const res = await fetch(`${BASE_URL}${route}`, {
          redirect: 'manual',
          signal: AbortSignal.timeout(5000)
        });

        const status = res.status;
        const isRedirect = status >= 300 && status < 400;
        const location = res.headers.get('location') || undefined;
        
        let html = '';
        if (status === 200) {
          html = await res.text();
        }

        let pass = true;
        let failureReason = '';

        if (status >= 400) {
          pass = false;
          failureReason = `HTTP Status ${status}`;
        } else if (status === 200) {
          // Search body for runtime error signatures
          for (const indicator of errorIndicators) {
            if (html.includes(indicator)) {
              pass = false;
              failureReason = `Found error indicator: "${indicator}"`;
              break;
            }
          }
        }

        results.push({
          route,
          status,
          text: pass ? 'PASS' : `FAIL (${failureReason})`,
          location,
          pass
        });

        if (!pass) {
          hasFailure = true;
        }
      } catch (err: any) {
        results.push({
          route,
          status: 0,
          text: `FAIL (Network error: ${err?.message || 'unknown'})`,
          pass: false
        });
        hasFailure = true;
      }
    }

    console.log('\n--- SMOKE TEST REPORT ---');
    for (const result of results) {
      const locationStr = result.location ? ` -> Redirects to ${result.location}` : '';
      console.log(`[${result.text}] ${result.route} (Status: ${result.status})${locationStr}`);
    }
    console.log('-------------------------\n');

    cleanUp();
    
    if (hasFailure) {
      console.log('Smoke tests completed with failures.');
      console.error('\n--- SERVER CONSOLE LOGS ---');
      console.error(serverOutput);
      console.error('----------------------------\n');
      process.exit(1);
    } else {
      console.log('All smoke tests passed successfully.');
      process.exit(0);
    }
  } catch (err) {
    console.error('An error occurred during smoke test execution:', err);
    cleanUp();
    process.exit(1);
  }
}

runTests();
