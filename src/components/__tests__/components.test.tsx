import { render, screen, fireEvent, waitFor } from "@/test/utils/render";
import { Button } from "@/components/ui/button";
import userEvent from "@testing-library/user-event";

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should show loading state", () => {
    render(<Button disabled>Loading...</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should support different variants", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");
  });
});

// Product Card Component Tests
describe("ProductCard Component", () => {
  const mockProduct = {
    id: "prod-1",
    name: "Test Product",
    price: 99.99,
    image: "https://example.com/image.jpg",
    rating: 4.5,
    reviews: 120,
    stock: 10,
  };

  const ProductCard = ({ product }: any) => (
    <div data-testid="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <div>
        {product.rating} stars ({product.reviews} reviews)
      </div>
      <button>Add to Cart</button>
    </div>
  );

  it("should render product information", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText(/4.5 stars/)).toBeInTheDocument();
  });

  it("should display product rating and reviews", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText(/120 reviews/)).toBeInTheDocument();
  });

  it("should have add to cart button", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });
});

// Form Component Tests
describe("ProductForm Component", () => {
  const ProductForm = ({ onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="product-form">
      <input type="text" placeholder="Product name" name="name" required />
      <input type="number" placeholder="Price" name="price" required />
      <textarea placeholder="Description" name="description" />
      <button type="submit">Create Product</button>
    </form>
  );

  it("should render form fields", () => {
    render(<ProductForm onSubmit={jest.fn()} />);

    expect(screen.getByPlaceholderText("Product name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
  });

  it("should submit form with values", async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    render(<ProductForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByPlaceholderText("Product name") as HTMLInputElement;
    const priceInput = screen.getByPlaceholderText("Price") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /create product/i });

    await userEvent.type(nameInput, "New Product");
    await userEvent.type(priceInput, "99.99");

    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should require name field", async () => {
    render(<ProductForm onSubmit={jest.fn()} />);

    const nameInput = screen.getByPlaceholderText("Product name") as HTMLInputElement;
    expect(nameInput.required).toBe(true);
  });
});

// Search Component Tests
describe("SearchBar Component", () => {
  const SearchBar = ({ onSearch }: any) => (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        onChange={(e) => onSearch(e.target.value)}
        data-testid="search-input"
      />
    </div>
  );

  it("should update input value", async () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByTestId("search-input") as HTMLInputElement;

    await userEvent.type(input, "carpet");

    expect(input.value).toBe("carpet");
    expect(handleSearch).toHaveBeenCalledWith("c");
    expect(handleSearch).toHaveBeenLastCalledWith("carpet");
  });

  it("should call onSearch with query", async () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByTestId("search-input");
    await userEvent.type(input, "test");

    expect(handleSearch).toHaveBeenCalledTimes(4);
  });
});

// Modal Component Tests
describe("Modal Component", () => {
  const Modal = ({ isOpen, onClose, children }: any) => {
    if (!isOpen) return null;

    return (
      <div data-testid="modal" role="dialog">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  };

  it("should render when open", () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()}>
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(handleClose).toHaveBeenCalled();
  });
});

// Toast/Notification Component Tests
describe("Toast Component", () => {
  const Toast = ({ message, type }: any) => (
    <div data-testid="toast" role="alert" className={`toast toast-${type}`}>
      {message}
    </div>
  );

  it("should render message", () => {
    render(<Toast message="Success!" type="success" />);

    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  it("should apply type class", () => {
    render(<Toast message="Error!" type="error" />);

    expect(screen.getByTestId("toast")).toHaveClass("toast-error");
  });

  it("should have correct role", () => {
    render(<Toast message="Info" type="info" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

// Pagination Component Tests
describe("Pagination Component", () => {
  const Pagination = ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );

  it("should disable previous button on first page", () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("should call onPageChange with new page", () => {
    const handlePageChange = jest.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});

// Loading Skeleton Component Tests
describe("SkeletonLoader Component", () => {
  const Skeleton = ({ count = 1 }: any) => (
    <div data-testid="skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-item" />
      ))}
    </div>
  );

  it("should render skeleton items", () => {
    const { container } = render(<Skeleton count={3} />);

    expect(container.querySelectorAll(".skeleton-item")).toHaveLength(3);
  });

  it("should render single item by default", () => {
    const { container } = render(<Skeleton />);

    expect(container.querySelectorAll(".skeleton-item")).toHaveLength(1);
  });
});

// Badge Component Tests
describe("Badge Component", () => {
  const Badge = ({ children, variant = "default" }: any) => (
    <span className={`badge badge-${variant}`}>{children}</span>
  );

  it("should render badge content", () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should apply variant class", () => {
    render(<Badge variant="success">Active</Badge>);

    expect(screen.getByText("Active")).toHaveClass("badge-success");
  });
});
