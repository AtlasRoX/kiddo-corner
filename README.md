<div align="center">
  <img width="2520" height="690" alt="github-header-banner" src="https://github.com/user-attachments/assets/f662df65-ba28-457e-b03d-41c9c31fc839" />
  <h1 align="center">🍼 Kiddo Corner</h1>
  <p align="center">
    A full-stack e-commerce platform for adorable baby products, built with a modern tech stack.
  </p>
</div>

---

## ✨ About The Project

**Kiddo Corner** is a feature-rich, beautifully designed e-commerce solution tailored for selling baby products. It provides a seamless and delightful shopping experience for parents while offering a powerful and intuitive dashboard for administrators to manage every aspect of the store. From product variations to order management and site customization, Kiddo Corner is a comprehensive platform built to bring joy to both customers and store owners.

This project showcases a modern, full-stack application built with Next.js, leveraging Supabase for the database and backend services, and Firebase for authentication and file storage.

---

## 🚀 Features

### 🛍️ Customer Storefront
* **Modern & Responsive UI:** A clean, mobile-first design that looks great on any device.
* **Advanced Product Discovery:** Powerful search, dynamic filtering (by category, price, stock), and sorting capabilities.
* **Product Variations:** Support for product attributes like color and size, with unique pricing, stock, and images for each variant.
* **Quick View & Compare:** Instantly view product details in a modal or compare multiple products side-by-side.
* **Wishlist & Recently Viewed:** Save favorite items and easily track products you've seen.
* **Multi-language Support:** Seamlessly switch between English and Bengali (বাংলা).
* **Secure Checkout:** A straightforward and secure multi-step checkout process.

### ⚙️ Admin Dashboard
* **Comprehensive Dashboard:** At-a-glance overview of products, orders, and reviews.
* **Full Product Management:** Create, edit, and manage products with a rich Markdown editor, image uploads (local & URL), and video embedding.
* **Dynamic Attributes:** Define product-specific colors, sizes, and generate variations with unique SKUs, pricing, stock levels, and images.
* **Order Management:** View, search, and update the status of all customer orders.
* **Review & Testimonial Management:** Manage and feature customer reviews and testimonials.
* **Site & Appearance Customization:** Easily update site settings like name, logo, social media links, theme colors, and the default language.
* **Content Management:** Control system messages, shipping costs, and payment methods directly from the dashboard.
* **Secure & Role-Based:** Protected routes ensure only authenticated admins can access the dashboard.

---

## 🛠️ Tech Stack

This project is built with a modern and scalable technology stack:

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Database & Backend:** [Supabase](https://supabase.io/)
* **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
* **File Storage:** [Firebase Storage](https://firebase.google.com/docs/storage)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **UI Components:** Radix UI, Framer Motion, Recharts
* **State Management:** React Context API & `use-sync-external-store`
* **Form Handling:** React Hook Form with Zod for validation
* **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* Node.js (v18 or later)
* `pnpm` (or your preferred package manager)
* A Supabase project
* A Firebase project

### Installation

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/your-username/kiddo-corner.git
    cd kiddo-corner
    ```

2.  **Install Dependencies**
    ```sh
    pnpm install
    ```

3.  **Set Up Environment Variables**

    Create a `.env.local` file in the root of the project and add your credentials from your Supabase and Firebase projects.

    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    ```

4.  **Set Up the Database**

    You will need to create the required tables in your Supabase project. The necessary schema can be inferred from the TypeScript definitions located in the `/lib/types` and `/lib/services` directories.

### Running the Development Server

Start the development server:

```sh
pnpm dev
````

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

-----

## 📂 Project Structure

Here's a brief overview of the key folders and files in this project:

```
kudea-23/
├── app/                  # Main application routes (App Router)
│   ├── (customer)/       # Customer-facing pages
│   └── admin/            # Admin dashboard pages
├── components/           # Reusable React components
│   ├── ui/               # UI components from shadcn/ui
│   └── ...
├── contexts/             # React context providers for state management
├── hooks/                # Custom React hooks
├── lib/                  # Helper functions, services, and type definitions
│   ├── services/         # API calls to Supabase/Firebase
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── styles/               # Global styles
```

-----

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

-----

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

-----

<p align="center"\>
Made with ❤️ for all the little ones.
</p>
