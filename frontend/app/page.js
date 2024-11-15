import DonorTable from "@/components/DonorTable";

export default function Home() {
  const donorData = [
    {
      firstName: "Aiden",
      lastName: "Rath",
      city: "Chilliwack",
      totalDonations: "36,419",
      lastGiftAmount: "87",
      lastGiftDate: "2021/09/17",
      lifecycleStage: "Active",
      comment: "",
    },
    {
      firstName: "Janie",
      lastName: "Bahringer",
      city: "Kelowna",
      totalDonations: "735",
      lastGiftAmount: "262",
      lastGiftDate: "2018/05/28",
      lifecycleStage: "Lapsed",
      comment: "",
    },
    {
      firstName: "Sigmund",
      lastName: "Wyman",
      city: "Nelson",
      totalDonations: "34,911",
      lastGiftAmount: "3,104",
      lastGiftDate: "2024/03/31",
      lifecycleStage: "New",
      comment: "",
    },
    {
      firstName: "Nicola",
      lastName: "Rath",
      city: "Squamish",
      totalDonations: "40,251",
      lastGiftAmount: "1,973",
      lastGiftDate: "2016/11/17",
      lifecycleStage: "Lapsed",
      comment: "",
    },
    {
      firstName: "Jett",
      lastName: "Prohaska",
      city: "Sooke",
      totalDonations: "15,249",
      lastGiftAmount: "590",
      lastGiftDate: "2019/10/09",
      lifecycleStage: "At-Risk",
      comment: "",
    },
    {
      firstName: "Virgie",
      lastName: "Russel",
      city: "Courtenay",
      totalDonations: "4,571",
      lastGiftAmount: "6,707",
      lastGiftDate: "2021/11/01",
      lifecycleStage: "Active",
      comment: "",
    },
    {
      firstName: "Pearl",
      lastName: "Torphy",
      city: "Fort Nelson",
      totalDonations: "32,355",
      lastGiftAmount: "8,615",
      lastGiftDate: "2024/03/21",
      lifecycleStage: "New",
      comment: "",
    },
    {
      firstName: "Kathryn",
      lastName: "Schoen",
      city: "Maple Ridge",
      totalDonations: "31,023",
      lastGiftAmount: "1,592",
      lastGiftDate: "2023/12/12",
      lifecycleStage: "Active",
      comment: "",
    },
    {
      firstName: "Courtney",
      lastName: "Schimmel",
      city: "Trail",
      totalDonations: "48,526",
      lastGiftAmount: "3,767",
      lastGiftDate: "2021/06/06",
      lifecycleStage: "Active",
      comment: "",
    },
    {
      firstName: "Micah",
      lastName: "Nicolas",
      city: "Penticton",
      totalDonations: "42,019",
      lastGiftAmount: "8,848",
      lastGiftDate: "2020/08/12",
      lifecycleStage: "At-Risk",
      comment: "",
    },
  ];

  return (
    <div>
      <DonorTable />
    </div>
  );
}
