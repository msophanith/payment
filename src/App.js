import { Heading, Highlight } from "@chakra-ui/react";
import ListProduct from "./listProduct";
import "./styles.css";

export default function App() {
  return (
    <div>
      <Heading
        lineHeight="tall"
        mx="60px"
        onClick={() => window.location.reload()}
        style={{ cursor: "pointer" }}
      >
        <Highlight
          query="Payment"
          styles={{
            px: "2",
            rounded: "full",
            bg: "red.100"
          }}
        >
          Mysabay Payment
        </Highlight>
      </Heading>
      <hr />
      <ListProduct />
    </div>
  );
}
