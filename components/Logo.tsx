"use client"

import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  showTagline?: boolean
  className?: string
}

export default function Logo({ showTagline = false, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Image - Replace with your actual logo */}
      {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">PF</span>
      </div> */}


      <Image src="https://i.postimg.cc/v4JMgLxH/Pak-Fix-Logo-Design.png" alt="PakFix Logo" width={80} height={80} />
      
      {/* Logo Text */}
      {/* <div className="flex flex-col">
        <span className="font-bold text-xl text-gray-900">PakFix</span>
        {showTagline && (
          <span className="text-xs text-gray-500">Home Services</span>
        )}
      </div> */}
    </Link>
  )
} 