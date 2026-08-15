# eKart — Mithai Junction

Full-stack Indian sweets e-commerce app: a **React** storefront backed by **Spring Boot** microservices (Infosys-style eKart), branded as **Mithai Junction**.

Shop catalog, cart, wishlist, orders, COD / Razorpay checkout, and an admin panel for products, categories, offers, orders, customers, and reviews.

## Architecture

```
Browser (Vite :5173)
        │  /api  (dev proxy)
        ▼
EkartGateway :4000
   ├─ ProductMS      :3334  →  ekart_product
   ├─ CustomerCartMS :3335  →  ekart_customercart
   ├─ CustomerMS     :3336  →  ekart_customer
   └─ PaymentMS      :3337  →  ekart_payment
```

The gateway validates JWT, rewrites `/api/**` to each service’s `/Ekart/...` APIs, and attaches a shared `X-Gateway-Secret` header. Services call each other over localhost with that secret (no Eureka/Consul).

## Repository layout

```
eKart/
├── ekart-frontend/          # React + TypeScript + Vite storefront
└── project/project/         # Spring Boot microservices + SQL
    ├── EkartGateway/
    ├── ProductMS/
    ├── CustomerCartMS/
    ├── CustomerMS/
    ├── PaymentMS/
    ├── EKart_MySql.sql
    └── MithaiJunction_ProductSeed.sql
```

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Axios |
| Backend | Java 11, Spring Boot 2.6.6, Spring Cloud Gateway, Spring Security, JPA |
| Data | MySQL 8 |
| Payments | Razorpay (online) + COD |

## Prerequisites

- **Node.js** 20+ and npm
- **JDK 11** and **Maven 3.8+**
- **MySQL** on `localhost:3306` (default user `root`)

## Database setup

1. Start MySQL and set password (default expected: `root`, or export `DB_PASSWORD`).
2. Run schema/bootstrap SQL:

```bash
mysql -u root -p < project/project/EKart_MySql.sql
```

3. Start **ProductMS** once so Hibernate creates/updates tables, then seed the catalog:

```bash
mysql -u root -p ekart_product < project/project/MithaiJunction_ProductSeed.sql
```

Schemas used: `ekart_product`, `ekart_customer`, `ekart_customercart`, `ekart_payment`.  
There is no seeded shopper account — register via the UI or `POST /api/auth/register`.

## Run the backend

From each service folder under `project/project/`, start in this order (ProductMS first if you plan to seed immediately):

```bash
cd project/project/ProductMS && mvn spring-boot:run
cd project/project/CustomerCartMS && mvn spring-boot:run
cd project/project/CustomerMS && mvn spring-boot:run
cd project/project/PaymentMS && mvn spring-boot:run
cd project/project/EkartGateway && mvn spring-boot:run
```

| Service | Port | Role |
|---------|------|------|
| ProductMS | 3334 | Products, categories, offers |
| CustomerCartMS | 3335 | Cart & wishlist |
| CustomerMS | 3336 | Auth (JWT), customers, addresses, orders, reviews |
| PaymentMS | 3337 | Razorpay payments |
| EkartGateway | **4000** | API gateway |

Useful env vars (optional; defaults exist for local dev):

| Variable | Used by | Purpose |
|----------|---------|---------|
| `DB_PASSWORD` | All MS | MySQL password (default `root`) |
| `JWT_SECRET` | CustomerMS + Gateway | HS256 signing key |
| `GATEWAY_SHARED_SECRET` | Gateway + all MS | `X-Gateway-Secret` value |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | PaymentMS | Online payments |

## Run the frontend

```bash
cd ekart-frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**.  
`VITE_API_BASE_URL=/api` is proxied by Vite to `http://localhost:4000`, so the browser talks only to the gateway.

| Script | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |

## API surface (via gateway)

Public (no Bearer token):

- `POST /api/auth/login`, `/api/auth/register`, `/api/auth/refresh-token`
- `GET /api/products/**`, `/api/categories/**`, `/api/offers/**`, `/api/reviews/**`

Authenticated shopper / admin routes include `/api/cart`, `/api/wishlist`, `/api/orders`, `/api/customers`, `/api/payments`, and `/api/admin/**`.

Prefer `/api/...` on port **4000**. Older sample URLs in `URLCommands-Ekart.txt` use legacy `/Ekart/...` paths.

## App features

**Storefront:** home, catalog, product detail, cart, wishlist, checkout (delivery / pickup), COD or online pay, profile, orders.

**Admin** (`ADMIN` role): dashboard, products, categories, offers, orders, customers, reviews.

Pickup store reference: Mithai Junction (configured in CustomerMS).

## License

Project coursework / personal use unless otherwise stated.
