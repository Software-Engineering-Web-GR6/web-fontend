import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { useState } from "react"

// type ButtonProps = PropsWithChildren<
//     ButtonHTMLAttributes<HTMLButtonElement> & {
//         variant?: 'primary' | 'secondary'
//     }
// >
type ButtonProps = {
    active: boolean
    onToggle: () => void
    children: React.ReactNode
}

function Button({ active, onToggle }: ButtonProps) {

    const baseStyle = {
        border: "1px solid",
        borderRadius: "100px",
        padding: "15px 25px",
        fontSize: "18px",
        fontWeight: 600,
    }

    const style = active
        ? { background: "#0ea5e9", color: "#fff" }
        : { background: "#e5e7eb", color: "#111827" }

    return (
        <button onClick={onToggle}
            style={{ ...baseStyle, ...style }}
        >
        </button>
    )
}

export default Button
