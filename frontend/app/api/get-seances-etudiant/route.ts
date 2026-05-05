import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase-admin.init";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "UserId est requis" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Récupérer tous les users pour mapper les noms
    const usersSnapshot = await db.collection("users").get();
    const usersMap = new Map();
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      usersMap.set(doc.id, {
        id: doc.id,
        username: data.username || data.email || doc.id
      });
    });
    
    // Récupérer toutes les séances
    const snapshot = await db.collection("seance").get();
    const seances = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Vérifier si l'étudiant est dans participants (gère tous les formats)
      let isParticipant = false;
      
      if (Array.isArray(data.participants)) {
        for (const participant of data.participants) {
          // Cas 1: participant est une string (ID direct)
          if (typeof participant === 'string' && participant === userId) {
            isParticipant = true;
            break;
          }
          // Cas 2: participant est un objet avec un id
          if (typeof participant === 'object' && participant !== null) {
            if (participant.id === userId || participant.email === userId) {
              isParticipant = true;
              break;
            }
          }
        }
      }
      
      if (isParticipant) {
        // Récupérer le nom du responsable (gère tous les formats)
        let responsableName = "Non assigné";
        if (data.responsable) {
          if (typeof data.responsable === 'string') {
            // Chercher dans la map des users
            const user = usersMap.get(data.responsable);
            responsableName = user ? user.username : data.responsable;
          } else if (typeof data.responsable === 'object' && data.responsable !== null) {
            responsableName = data.responsable.username || data.responsable.email || "Responsable";
          }
        }
        
        // Formater l'heure
        const timeStr = data.heure_de_debut && data.heure_de_fin 
          ? `${data.heure_de_debut} - ${data.heure_de_fin}`
          : data.heure_de_debut || data.time || "Horaire non défini";
        
        seances.push({ 
          id: doc.id,
          date: data.date || "Date non définie",
          time: timeStr,
          matiere: data.seanceName || data.matiere || data.session || "Sans titre",
          enseignant: responsableName,
          status: "Absent", // Statut par défaut (à personnaliser si vous avez un système de présence)
        });
      }
    });
    
    // Trier par date (plus récent d'abord)
    seances.sort((a, b) => {
      if (!a.date || a.date === "Date non définie") return 1;
      if (!b.date || b.date === "Date non définie") return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return NextResponse.json({ 
      success: true, 
      seances,
      total: seances.length 
    });
    
  } catch (error: any) {
    console.error("Erreur API get-seances-etudiant:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}