const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";
const BACKUP_FILENAME = "sehati_backup.json";

// Client ID resmi dari Google Cloud Console user
const CLIENT_ID =
  "236442176440-e6j1e72mfhss8bq3nf8qveq2s5pflm8p.apps.googleusercontent.com";

// Definisi tipe untuk Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export const googleDriveService = {
  authenticate: (onSuccess: (token: string) => void) => {
    if (!window.google) {
      alert("Pustaka Google belum siap. Periksa koneksi internet Anda.");
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.appdata email profile",
      callback: (response: any) => {
        if (response.access_token) {
          onSuccess(response.access_token);
        } else if (response.error) {
          console.error("OAuth Error:", response.error);
          alert("Gagal menghubungkan ke Google: " + response.error);
        }
      },
    });
    client.requestAccessToken();
  },

  findBackupFile: async (token: string) => {
    const response = await fetch(
      `${DRIVE_API_BASE}/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      const error = new Error(`Gagal mencari backup: ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  },

  downloadBackup: async (token: string, fileId: string) => {
    const response = await fetch(
      `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      const error = new Error(`Gagal download backup: ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  },

  uploadBackup: async (token: string, data: any) => {
    try {
      const fileId = await googleDriveService.findBackupFile(token);
      const metadata = {
        name: BACKUP_FILENAME,
        parents: ["appDataFolder"],
      };

      const formData = new FormData();
      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      formData.append(
        "file",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );

      let url = `${UPLOAD_API_BASE}/files?uploadType=multipart`;
      let method = "POST";

      if (fileId) {
        url = `${UPLOAD_API_BASE}/files/${fileId}?uploadType=multipart`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = new Error(`Gagal upload backup: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }
      return await response.json();
    } catch (e) {
      console.error("Gagal upload ke Drive:", e);
      throw e;
    }
  },

  getUserProfile: async (token: string) => {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      const error = new Error(`Gagal mengambil profil: ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }
    return await response.json();
  },
};
