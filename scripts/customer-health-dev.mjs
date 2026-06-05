#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const mode = process.argv[2] ?? 'full'

const backendHost = process.env.CUSTOMER_HEALTH_HOST ?? '127.0.0.1'
const backendPort = process.env.CUSTOMER_HEALTH_PORT ?? '8181'
const frontendHost = process.env.VITE_HOST ?? '127.0.0.1'
const frontendPort = process.env.VITE_PORT ?? '5173'
const apiBaseUrl = process.env.VITE_CUSTOMER_HEALTH_API_BASE ?? `http://${backendHost}:${backendPort}`

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const usage = () => {
  console.error('Usage: node scripts/customer-health-dev.mjs [backend|full]')
  process.exit(1)
}

if (!['backend', 'full'].includes(mode)) usage()

const pythonCandidates = () => {
  const candidates = []
  if (process.env.PYTHON) candidates.push({ command: process.env.PYTHON, args: [] })

  const bundledPython = join(
    homedir(),
    '.cache',
    'codex-runtimes',
    'codex-primary-runtime',
    'dependencies',
    'python',
    process.platform === 'win32' ? 'python.exe' : 'bin/python',
  )
  if (existsSync(bundledPython)) candidates.push({ command: bundledPython, args: [] })

  candidates.push({ command: 'python', args: [] })
  candidates.push({ command: 'python3', args: [] })
  if (process.platform === 'win32') candidates.push({ command: 'py', args: ['-3'] })
  return candidates
}

const findPython = () => {
  for (const candidate of pythonCandidates()) {
    const result = spawnSync(candidate.command, [...candidate.args, '-c', 'import sys; print(sys.executable)'], {
      cwd: rootDir,
      encoding: 'utf8',
      windowsHide: true,
    })
    if (result.status === 0) return candidate
  }

  console.error('Unable to find a working Python 3 runtime. Set PYTHON to the full path of python.exe and retry.')
  process.exit(1)
}

const children = new Set()
let shuttingDown = false

const prefixOutput = (label, stream, writer) => {
  let buffered = ''
  stream.on('data', (chunk) => {
    buffered += chunk.toString()
    const lines = buffered.split(/\r?\n/)
    buffered = lines.pop() ?? ''
    for (const line of lines) {
      if (line.length) writer.write(`[${label}] ${line}\n`)
    }
  })
}

const run = (label, command, args, env) => {
  const useShell = process.platform === 'win32' && /\.(cmd|bat)$/i.test(command)
  const child = spawn(command, args, {
    cwd: rootDir,
    env,
    shell: useShell,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  children.add(child)
  prefixOutput(label, child.stdout, process.stdout)
  prefixOutput(label, child.stderr, process.stderr)

  child.on('exit', (code, signal) => {
    children.delete(child)
    if (!shuttingDown) {
      const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`
      console.error(`[${label}] exited with ${reason}`)
      shutdown(code ?? 1)
    }
  })

  child.on('error', (error) => {
    console.error(`[${label}] ${error.message}`)
    shutdown(1)
  })

  return child
}

const shutdown = (code = 0) => {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) child.kill()
  setTimeout(() => process.exit(code), 150)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

const python = findPython()
const backendEnv = {
  ...process.env,
  CUSTOMER_HEALTH_ALLOWED_ORIGIN: process.env.CUSTOMER_HEALTH_ALLOWED_ORIGIN ?? '*',
  CUSTOMER_HEALTH_RETURN_RESET_TOKEN: process.env.CUSTOMER_HEALTH_RETURN_RESET_TOKEN ?? '1',
}

console.log(`Customer Health API: http://${backendHost}:${backendPort}`)
run('backend', python.command, [...python.args, '-m', 'backend.run', '--host', backendHost, '--port', backendPort], backendEnv)

if (mode === 'full') {
  const frontendEnv = {
    ...process.env,
    VITE_CUSTOMER_HEALTH_API_BASE: apiBaseUrl,
  }
  console.log(`Customer Health app: http://${frontendHost}:${frontendPort}`)
  run('frontend', npmCommand, ['run', 'dev:frontend', '--', '--host', frontendHost, '--port', frontendPort], frontendEnv)
}
