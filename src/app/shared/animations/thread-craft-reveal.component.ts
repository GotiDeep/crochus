import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-thread-craft-reveal',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="craft-reveal-wrapper" role="region" aria-label="Handmade craft animation showcase">
      <!-- Ambient Woven Glow -->
      <div class="ambient-glow" aria-hidden="true"></div>

      <!-- Main Animated SVG Scene -->
      <svg
        class="craft-stage-svg"
        viewBox="0 0 540 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <!-- Gradients -->
          <linearGradient id="threadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D4C98A" />
            <stop offset="50%" stop-color="#4A5C2F" />
            <stop offset="100%" stop-color="#D4C98A" />
          </linearGradient>

          <linearGradient id="goldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#D4C98A" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#4A5C2F" stop-opacity="0.9" />
          </linearGradient>

          <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4A5C2F" />
            <stop offset="100%" stop-color="#2C3A1A" />
          </linearGradient>

          <linearGradient id="petalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D4C98A" />
            <stop offset="100%" stop-color="#C8C49A" />
          </linearGradient>

          <linearGradient id="petalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6B7F4A" />
            <stop offset="100%" stop-color="#4A5C2F" />
          </linearGradient>

          <!-- Drop Shadow Filter for Handmade Pieces -->
          <filter id="softCraftShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#2C3A1A" flood-opacity="0.18" />
          </filter>
        </defs>

        <!-- Ambient Circular Stitch Frame -->
        <circle
          cx="270"
          cy="180"
          r="150"
          stroke="#D4C98A"
          stroke-width="1.5"
          stroke-dasharray="6 6"
          opacity="0.45"
          class="stitch-orbit"
        />
        <circle
          cx="270"
          cy="180"
          r="168"
          stroke="#C8C49A"
          stroke-width="1"
          stroke-dasharray="3 8"
          opacity="0.3"
          class="stitch-orbit-reverse"
        />

        <!-- The Continuous Moving Yarn Thread -->
        <path
          class="yarn-thread-main"
          d="M 30,190 C 80,120 140,240 210,180 C 270,120 330,240 390,170 C 440,110 490,200 520,180"
          stroke="url(#threadGrad)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <path
          class="yarn-loop-deco"
          d="M 120,210 C 95,260 170,280 185,225 C 195,190 145,175 120,210 Z"
          stroke="#D4C98A"
          stroke-width="2"
          stroke-dasharray="4 3"
          fill="none"
        />

        <path
          class="yarn-loop-deco-2"
          d="M 350,150 C 375,100 440,120 425,175 C 415,210 365,190 350,150 Z"
          stroke="#D4C98A"
          stroke-width="2"
          stroke-dasharray="4 3"
          fill="none"
        />

        <!-- ── HANDMADE ILLUSTRATION 1: Crochet Bag (Left) ── -->
        <g class="craft-item craft-bag" filter="url(#softCraftShadow)" transform="translate(90, 110)">
          <!-- Handle -->
          <path
            d="M 28,32 C 28,12 62,12 62,32"
            stroke="#D4C98A"
            stroke-width="3.5"
            stroke-linecap="round"
            fill="none"
          />
          <!-- Bag Body -->
          <rect
            x="16"
            y="30"
            width="58"
            height="52"
            rx="12"
            fill="url(#bagGrad)"
            stroke="#D4C98A"
            stroke-width="1.5"
          />
          <!-- Crochet stitch textures on bag -->
          <path d="M 22,44 Q 30,48 38,44 Q 46,48 54,44 Q 62,48 68,44" stroke="#D4C98A" stroke-width="1.4" fill="none" opacity="0.8" />
          <path d="M 22,54 Q 30,58 38,54 Q 46,58 54,54 Q 62,58 68,54" stroke="#D4C98A" stroke-width="1.4" fill="none" opacity="0.8" />
          <path d="M 22,64 Q 30,68 38,64 Q 46,68 54,64 Q 62,68 68,64" stroke="#D4C98A" stroke-width="1.4" fill="none" opacity="0.8" />
          <!-- Button / Flower Accent -->
          <circle cx="45" cy="38" r="4.5" fill="#D4C98A" />
          <circle cx="45" cy="38" r="2" fill="#4A5C2F" />
        </g>

        <!-- ── HANDMADE ILLUSTRATION 2: Flower Bouquet (Center Top) ── -->
        <g class="craft-item craft-bouquet" filter="url(#softCraftShadow)" transform="translate(225, 60)">
          <!-- Stems -->
          <path d="M 45,95 L 40,60" stroke="#4A5C2F" stroke-width="2.5" stroke-linecap="round" />
          <path d="M 45,95 L 25,65" stroke="#4A5C2F" stroke-width="2" stroke-linecap="round" />
          <path d="M 45,95 L 65,65" stroke="#4A5C2F" stroke-width="2" stroke-linecap="round" />

          <!-- Leaves -->
          <path d="M 36,75 Q 26,72 32,82 Z" fill="#6B7F4A" />
          <path d="M 52,78 Q 62,75 56,85 Z" fill="#6B7F4A" />

          <!-- Bouquet Wrap Cone -->
          <polygon points="32,95 58,95 45,115" fill="#F5F0E0" stroke="#C8C49A" stroke-width="1.5" />
          <!-- Ribbon Bow -->
          <path d="M 40,96 C 30,90 30,102 42,98 C 45,98 45,98 45,98 C 45,98 48,98 51,96 C 60,90 60,102 48,98" stroke="#D4C98A" stroke-width="2" fill="none" />

          <!-- Center Flower 1 (Rose/Bloom) -->
          <g transform="translate(42, 52)">
            <circle cx="0" cy="0" r="14" fill="url(#petalGrad1)" stroke="#4A5C2F" stroke-width="1.2" />
            <circle cx="0" cy="0" r="8" fill="#F5F0E0" />
            <circle cx="0" cy="0" r="4" fill="#4A5C2F" />
          </g>

          <!-- Left Flower 2 -->
          <g transform="translate(22, 60)">
            <circle cx="0" cy="0" r="11" fill="url(#petalGrad2)" stroke="#D4C98A" stroke-width="1" />
            <circle cx="0" cy="0" r="5" fill="#D4C98A" />
          </g>

          <!-- Right Flower 3 -->
          <g transform="translate(64, 62)">
            <circle cx="0" cy="0" r="11" fill="url(#petalGrad1)" stroke="#4A5C2F" stroke-width="1" />
            <circle cx="0" cy="0" r="5" fill="#4A5C2F" />
          </g>
        </g>

        <!-- ── HANDMADE ILLUSTRATION 3: Cute Keychain Charm (Right) ── -->
        <g class="craft-item craft-keychain" filter="url(#softCraftShadow)" transform="translate(365, 115)">
          <!-- Keyring Loop -->
          <circle cx="45" cy="22" r="10" stroke="#D4C98A" stroke-width="2.5" fill="none" />
          <!-- Chain Links -->
          <line x1="45" y1="32" x2="45" y2="44" stroke="#D4C98A" stroke-width="2" stroke-dasharray="2 2" />
          <!-- Heart / Star Crochet Charm -->
          <path
            d="M 45,46 C 45,46 32,38 28,48 C 24,58 35,68 45,78 C 55,68 66,58 62,48 C 58,38 45,46 45,46 Z"
            fill="url(#goldGlow)"
            stroke="#2C3A1A"
            stroke-width="1.5"
          />
          <!-- Crochet stitch heart detail -->
          <circle cx="38" cy="50" r="1.5" fill="#2C3A1A" />
          <circle cx="52" cy="50" r="1.5" fill="#2C3A1A" />
          <path d="M 42,56 Q 45,59 48,56" stroke="#2C3A1A" stroke-width="1.5" fill="none" stroke-linecap="round" />
          <!-- Tassel fringe dangling below -->
          <line x1="42" y1="78" x2="39" y2="92" stroke="#6B7F4A" stroke-width="2" stroke-linecap="round" />
          <line x1="45" y1="78" x2="45" y2="94" stroke="#D4C98A" stroke-width="2.2" stroke-linecap="round" />
          <line x1="48" y1="78" x2="51" y2="92" stroke="#6B7F4A" stroke-width="2" stroke-linecap="round" />
        </g>

        <!-- ── HANDMADE ILLUSTRATION 4: Gift Box with Ribbon (Center Bottom) ── -->
        <g class="craft-item craft-gift" filter="url(#softCraftShadow)" transform="translate(230, 195)">
          <!-- Box Body -->
          <rect x="18" y="22" width="46" height="40" rx="6" fill="#F5F0E0" stroke="#C8C49A" stroke-width="1.5" />
          <!-- Box Lid -->
          <rect x="14" y="14" width="54" height="12" rx="4" fill="#4A5C2F" stroke="#D4C98A" stroke-width="1.5" />
          <!-- Vertical Ribbon -->
          <rect x="37" y="14" width="8" height="48" fill="#D4C98A" />
          <!-- Horizontal Ribbon -->
          <rect x="18" y="38" width="46" height="8" fill="#D4C98A" />
          <!-- Bow on Top -->
          <path d="M 41,14 C 33,4 27,14 41,14 Z" fill="#D4C98A" stroke="#2C3A1A" stroke-width="1" />
          <path d="M 41,14 C 49,4 55,14 41,14 Z" fill="#D4C98A" stroke="#2C3A1A" stroke-width="1" />
          <circle cx="41" cy="14" r="3" fill="#2C3A1A" />
        </g>

        <!-- Floating Sparkle & Stitch Stars -->
        <g class="sparkle-star s1" transform="translate(85, 80)">
          <path d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8 Z" fill="#D4C98A" />
        </g>
        <g class="sparkle-star s2" transform="translate(450, 90)">
          <path d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z" fill="#4A5C2F" />
        </g>
        <g class="sparkle-star s3" transform="translate(170, 260)">
          <path d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z" fill="#D4C98A" />
        </g>
        <g class="sparkle-star s4" transform="translate(370, 265)">
          <path d="M 0,-5 Q 0,0 5,0 Q 0,0 0,5 Q 0,0 -5,0 Q 0,0 0,-5 Z" fill="#6B7F4A" />
        </g>
        <g class="sparkle-star s5" transform="translate(270, 40)">
          <path d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z" fill="#D4C98A" />
        </g>
      </svg>

      <!-- Bottom Headline & Action Overlay -->
      <div class="reveal-content-card">
        <span class="craft-mini-badge">
          <span class="thread-dot">🧶</span>
          Handcrafted Creations
        </span>
        <h3 class="reveal-title">Little Things, Handmade with Love</h3>
        <p class="reveal-desc">Bags · Bouquets · Keychains · Gifts</p>

        <a routerLink="/shop" class="reveal-cta-btn" aria-label="Explore all handmade products">
          <span>Explore All Products</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .craft-reveal-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 24px 20px 20px;
      background: radial-gradient(circle at 50% 35%, #FFFFFF 0%, var(--c-surface) 60%, #F5F0E0 100%);
      border: 1px solid color-mix(in srgb, var(--c-accent) 60%, var(--border));
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(44, 58, 26, 0.08);
    }

    .ambient-glow {
      position: absolute;
      top: -30%;
      left: 10%;
      width: 80%;
      height: 80%;
      background: radial-gradient(circle, rgba(212, 201, 138, 0.3) 0%, rgba(74, 92, 47, 0.05) 50%, transparent 70%);
      pointer-events: none;
      animation: pulseGlow 6s ease-in-out infinite alternate;
    }

    .craft-stage-svg {
      width: 100%;
      max-width: 480px;
      height: auto;
      max-height: 270px;
      margin: 0 auto;
      overflow: visible;
    }

    /* Thread Orbit Rotations */
    .stitch-orbit {
      transform-origin: 270px 180px;
      animation: rotateOrbit 30s linear infinite;
    }

    .stitch-orbit-reverse {
      transform-origin: 270px 180px;
      animation: rotateOrbitRev 40s linear infinite;
    }

    /* Drawing Yarn Thread Animation */
    .yarn-thread-main {
      stroke-dasharray: 800;
      stroke-dashoffset: 800;
      animation: drawYarn 3s cubic-bezier(0.25, 1, 0.5, 1) forwards, floatYarn 4s ease-in-out 3s infinite alternate;
    }

    .yarn-loop-deco,
    .yarn-loop-deco-2 {
      stroke-dasharray: 300;
      stroke-dashoffset: 300;
      animation: drawYarn 2.4s ease 0.6s forwards;
    }

    /* Craft Items Reveal & Floating */
    .craft-item {
      opacity: 0;
      transform-origin: center;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.08);
      }
    }

    .craft-bag {
      animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards, gentleBob 5s ease-in-out 1.6s infinite;
    }

    .craft-bouquet {
      animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s forwards, gentleBob 5.5s ease-in-out 2s infinite alternate;
    }

    .craft-keychain {
      animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s forwards, gentleSway 4s ease-in-out 2.3s infinite alternate;
    }

    .craft-gift {
      animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.8s forwards, gentleBob 6s ease-in-out 2.6s infinite;
    }

    /* Floating Sparkles */
    .sparkle-star {
      opacity: 0;
      animation: sparkleFade 3s ease-in-out infinite;

      &.s1 { animation-delay: 1.2s; }
      &.s2 { animation-delay: 1.6s; }
      &.s3 { animation-delay: 2.0s; }
      &.s4 { animation-delay: 2.4s; }
      &.s5 { animation-delay: 2.8s; }
    }

    /* Content Card */
    .reveal-content-card {
      position: relative;
      z-index: 2;
      width: 100%;
      text-align: center;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      border: 1px solid color-mix(in srgb, var(--c-accent) 50%, transparent);
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: 0 4px 16px rgba(44, 58, 26, 0.06);
      opacity: 0;
      transform: translateY(12px);
      animation: cardFadeUp 0.8s ease 1.8s forwards;
    }

    .craft-mini-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--c-primary);
      margin-bottom: 4px;

      .thread-dot {
        font-size: 0.9rem;
      }
    }

    .reveal-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--c-text);
      margin: 0 0 2px;
      line-height: 1.2;
    }

    .reveal-desc {
      font-size: 0.78rem;
      color: var(--c-muted);
      margin: 0 0 10px;
      letter-spacing: 0.04em;
    }

    .reveal-cta-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--c-primary);
      color: #FFFFFF;
      text-decoration: none;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 7px 18px;
      border-radius: 20px;
      transition: all 0.25s ease;
      box-shadow: 0 2px 8px rgba(74, 92, 47, 0.25);

      &:hover {
        background: color-mix(in srgb, var(--c-primary) 85%, #000);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(74, 92, 47, 0.35);
      }
    }

    /* Keyframes */
    @keyframes drawYarn {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes floatYarn {
      0% { transform: translateY(0); }
      100% { transform: translateY(-3px); }
    }

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.6) translateY(12px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes gentleBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes gentleSway {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(4deg) translateY(-3px); }
    }

    @keyframes sparkleFade {
      0%, 100% { opacity: 0; transform: scale(0.4); }
      50% { opacity: 0.85; transform: scale(1.1); }
    }

    @keyframes cardFadeUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes rotateOrbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes rotateOrbitRev {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }

    @keyframes pulseGlow {
      0% { transform: scale(0.95); opacity: 0.6; }
      100% { transform: scale(1.1); opacity: 1; }
    }

    /* Accessibility: Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .ambient-glow,
      .stitch-orbit,
      .stitch-orbit-reverse,
      .yarn-thread-main,
      .yarn-loop-deco,
      .yarn-loop-deco-2,
      .craft-bag,
      .craft-bouquet,
      .craft-keychain,
      .craft-gift,
      .sparkle-star,
      .reveal-content-card {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
        stroke-dashoffset: 0 !important;
      }
    }

    @media (max-width: 600px) {
      .craft-reveal-wrapper {
        min-height: 380px;
        padding: 16px 14px 14px;
      }
      .reveal-title {
        font-size: 1.15rem;
      }
    }
  `]
})
export class ThreadCraftRevealComponent {}
