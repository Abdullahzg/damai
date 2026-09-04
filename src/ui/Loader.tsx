interface LoaderProps {
  text: string;
}

export function Loader({ text }: LoaderProps) {
  return (
    <div data-dam-ai-card>
      <div data-dam-ai-card-header>
        <span data-dam-ai-card-title>DAM AI</span>
      </div>
      <div data-dam-ai-loader>
        <div data-dam-ai-spinner />
        <span data-dam-ai-loader-text>{text}</span>
      </div>
    </div>
  );
}
