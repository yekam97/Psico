import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import {
    startOfMonth,
    endOfMonth,
    subMonths,
    format,
    isWithinInterval
} from "date-fns";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    try {
        // 1. Total Appointments (Current Month)
        const currentMonthAppointments = await prisma.appointment.count({
            where: { companyId, startTime: { gte: currentMonthStart, lte: currentMonthEnd } }
        });

        const prevMonthAppointments = await prisma.appointment.count({
            where: { companyId, startTime: { gte: prevMonthStart, lte: prevMonthEnd } }
        });

        // 2. Active Patients Count
        const totalPatients = await prisma.user.count({
            where: { companyId, role: "PATIENT" }
        });

        const prevMonthPatients = await prisma.user.count({
            where: { companyId, role: "PATIENT", createdAt: { lte: prevMonthEnd } }
        });

        // 3. Chart Data (Last 3 Months)
        const chartData = [];
        for (let i = 2; i >= 0; i--) {
            const mStart = startOfMonth(subMonths(now, i));
            const mEnd = endOfMonth(subMonths(now, i));
            const count = await prisma.appointment.count({
                where: { companyId, startTime: { gte: mStart, lte: mEnd } }
            });
            chartData.push({
                month: format(mStart, 'MMM', { locale: undefined }), // Simplified for now
                appointments: count
            });
        }

        // 4. Growth Calculations
        const patientGrowth = prevMonthPatients === 0 ? 0 : ((totalPatients - prevMonthPatients) / prevMonthPatients) * 100;
        const appointmentGrowth = prevMonthAppointments === 0 ? 0 : ((currentMonthAppointments - prevMonthAppointments) / prevMonthAppointments) * 100;

        return NextResponse.json({
            monthAppointments: currentMonthAppointments,
            totalPatients: totalPatients,
            patientGrowth: Math.round(patientGrowth * 10) / 10,
            appointmentGrowth: Math.round(appointmentGrowth * 10) / 10,
            chartData: chartData
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Error fetching stats" }, { status: 500 });
    }
}
