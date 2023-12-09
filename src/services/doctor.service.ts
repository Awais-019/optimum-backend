import { APPOINTMENTTYPES, Doctor, GENDER } from "@prisma/client";
import prisma from "../prisma";

export default {
  create: (experience: number, gender: string, userId: string) => {
    return prisma.$transaction(async () => {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          gender: gender.toLowerCase() == "male" ? GENDER.MALE : GENDER.FEMALE,
        },
      });
      return prisma.doctor.create({
        data: {
          experience,
          userId,
        },
      });
    });
  },
  findByUserId: (userId: string): Promise<Doctor | null> => {
    return prisma.doctor.findFirst({
      where: {
        userId,
      },
    });
  },
  getDocument: (doctorId: string) => {
    return prisma.doctor.findFirst({
      where: {
        id: doctorId,
      },
    });
  },
  createCharges: async (
    charges: {
      appointment_type: string;
      charges: number;
    }[],
    doctorId: string
  ) => {
    if (charges.length == 2) {
      await prisma.doctor.update({
        where: {
          id: doctorId,
        },
        data: {
          appointmentTypes: {
            set: [APPOINTMENTTYPES.PHYSICAL, APPOINTMENTTYPES.VIRTUAL],
          },
        },
      });
    }

    return prisma.charges.createMany({
      data: charges.map((charge) => ({
        appointment_type:
          charge.appointment_type == "PHYSICAL"
            ? APPOINTMENTTYPES.PHYSICAL
            : APPOINTMENTTYPES.VIRTUAL,
        charges: charge.charges,
        doctorId: doctorId,
      })),
    });
  },
  createLocation: (
    location: {
      clinicName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
    },
    doctorId: string
  ) => {
    return prisma.location.create({
      data: {
        ...location,
        doctorId,
      },
    });
  },
};
