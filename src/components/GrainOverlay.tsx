"use client";

export default function GrainOverlay() {
  return (
    <div 
      className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden" 
      aria-hidden="true"
    >
      <div 
        className="absolute inset-[-200%] grain-texture opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />
    </div>
  );
}
