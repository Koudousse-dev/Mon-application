import type { ParentRequest, NannyApplication } from "./schema";

export interface MatchScore {
  requestId: string;
  nannyId: string;
  score: number; // 0-100
  reasons: string[];
}

export interface Match extends MatchScore {
  request: ParentRequest;
  nanny: NannyApplication;
}

export function calculateMatchScore(
  request: ParentRequest,
  nanny: NannyApplication
): MatchScore {
  let score = 0;
  const reasons: string[] = [];

  const typeServiceMatch = calculateTypeMatch(request.typeService, nanny.typePoste);
  score += typeServiceMatch.score;
  if (typeServiceMatch.score > 0) {
    reasons.push(typeServiceMatch.reason);
  }

  const locationMatch = calculateLocationMatch(request.adresse, nanny.adresse);
  score += locationMatch.score;
  if (locationMatch.score > 0) {
    reasons.push(locationMatch.reason);
  }

  const experienceMatch = calculateExperienceMatch(nanny.experience);
  score += experienceMatch.score;
  if (experienceMatch.score > 0) {
    reasons.push(experienceMatch.reason);
  }

  const availabilityMatch = calculateAvailabilityMatch(
    request.horaireDebut,
    request.horaireFin,
    nanny.disponibilites
  );
  score += availabilityMatch.score;
  if (availabilityMatch.score > 0) {
    reasons.push(availabilityMatch.reason);
  }

  return {
    requestId: request.id,
    nannyId: nanny.id,
    score: Math.round(score),
    reasons,
  };
}

function calculateTypeMatch(
  requestType: string,
  nannyType: string
): { score: number; reason: string } {
  const typeMapping: Record<string, string[]> = {
    "Garde régulière": ["Nounou à temps plein", "Nounou régulière"],
    "Garde occasionnelle": ["Nounou occasionnelle", "Baby-sitter"],
    "Week-end": ["Nounou occasionnelle", "Baby-sitter"],
    "Aide aux devoirs": ["Éducateur/éducatrice", "Aide aux devoirs"],
    "Aide à la personne": ["Aide à domicile", "Auxiliaire de vie"],
  };

  const compatibleTypes = typeMapping[requestType] || [];
  
  if (compatibleTypes.includes(nannyType)) {
    return {
      score: 40,
      reason: `Type de poste compatible (${nannyType})`,
    };
  }

  if (requestType.toLowerCase().includes(nannyType.toLowerCase()) || 
      nannyType.toLowerCase().includes(requestType.toLowerCase())) {
    return {
      score: 20,
      reason: "Type de poste partiellement compatible",
    };
  }

  return { score: 0, reason: "" };
}

function calculateLocationMatch(
  requestAddress: string,
  nannyAddress: string
): { score: number; reason: string } {
  const requestLower = requestAddress.toLowerCase().trim();
  const nannyLower = nannyAddress.toLowerCase().trim();

  if (requestLower === nannyLower) {
    return {
      score: 25,
      reason: "Adresse identique",
    };
  }

  const requestWords = requestLower.split(/[\s,]+/);
  const nannyWords = nannyLower.split(/[\s,]+/);
  
  const commonWords = requestWords.filter(word => 
    word.length > 2 && nannyWords.includes(word)
  );

  if (commonWords.length >= 2) {
    return {
      score: 20,
      reason: `Localisation proche (${commonWords.slice(0, 2).join(", ")})`,
    };
  }

  if (commonWords.length === 1) {
    return {
      score: 10,
      reason: `Même quartier/zone (${commonWords[0]})`,
    };
  }

  return { score: 0, reason: "" };
}

function calculateExperienceMatch(
  nannyExperience: string
): { score: number; reason: string } {
  const experienceLower = nannyExperience.toLowerCase();

  if (experienceLower.includes("5 ans") || experienceLower.includes("plus de 5")) {
    return {
      score: 20,
      reason: "Très expérimentée (5+ ans)",
    };
  }

  if (experienceLower.includes("3 ans") || experienceLower.includes("4 ans")) {
    return {
      score: 15,
      reason: "Expérimentée (3-4 ans)",
    };
  }

  if (experienceLower.includes("1 an") || experienceLower.includes("2 ans")) {
    return {
      score: 10,
      reason: "Expérience confirmée (1-2 ans)",
    };
  }

  if (experienceLower.includes("débutant") || experienceLower.includes("moins d'un an")) {
    return {
      score: 5,
      reason: "Débutante motivée",
    };
  }

  return {
    score: 5,
    reason: "Profil intéressant",
  };
}

function calculateAvailabilityMatch(
  requestStart: string | null,
  requestEnd: string | null,
  nannyAvailability: string | null
): { score: number; reason: string } {
  if (!nannyAvailability || nannyAvailability.trim() === "") {
    return { score: 5, reason: "Disponibilités à discuter" };
  }

  const availabilityLower = nannyAvailability.toLowerCase();

  if (availabilityLower.includes("immédiat") || availabilityLower.includes("tout de suite")) {
    return {
      score: 15,
      reason: "Disponible immédiatement",
    };
  }

  if (availabilityLower.includes("flexible") || availabilityLower.includes("toute la semaine")) {
    return {
      score: 15,
      reason: "Horaires flexibles",
    };
  }

  if (requestStart && requestEnd) {
    const requestHours = `${requestStart}-${requestEnd}`.toLowerCase();
    
    if (availabilityLower.includes(requestStart) || availabilityLower.includes(requestEnd)) {
      return {
        score: 10,
        reason: "Disponibilités compatibles avec horaires demandés",
      };
    }
  }

  if (availabilityLower.includes("week-end") || availabilityLower.includes("samedi") || availabilityLower.includes("dimanche")) {
    return {
      score: 10,
      reason: "Disponible en week-end",
    };
  }

  return {
    score: 5,
    reason: "Disponibilités à vérifier",
  };
}

export function findBestMatches(
  requests: ParentRequest[],
  nannies: NannyApplication[],
  minScore: number = 30
): Match[] {
  const matches: Match[] = [];

  for (const request of requests) {
    if (request.statut !== "en_attente") continue;

    for (const nanny of nannies) {
      if (nanny.statut === "traite") continue;

      const matchScore = calculateMatchScore(request, nanny);
      
      if (matchScore.score >= minScore) {
        matches.push({
          ...matchScore,
          request,
          nanny,
        });
      }
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

export function getBestMatchForRequest(
  request: ParentRequest,
  nannies: NannyApplication[]
): Match | null {
  let bestMatch: Match | null = null;
  let bestScore = 0;

  for (const nanny of nannies) {
    if (nanny.statut === "traite") continue;

    const matchScore = calculateMatchScore(request, nanny);
    
    if (matchScore.score > bestScore) {
      bestScore = matchScore.score;
      bestMatch = {
        ...matchScore,
        request,
        nanny,
      };
    }
  }

  return bestMatch && bestMatch.score >= 30 ? bestMatch : null;
}
