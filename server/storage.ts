import { MongoClient, ObjectId } from "mongodb";
import {
  User,
  InsertUser,
  Form,
  InsertForm,
  FormSubmission,
  InsertFormSubmission,
  ViewRecord,
  InsertViewRecord,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByVerificationToken(token: string): Promise<User | null>;
  getUserByResetToken(token: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | null>;
  verifyUser(id: string): Promise<User | null>;
  updateStripeInfo(
    userId: string,
    customerId: string,
    subscriptionId?: string
  ): Promise<User | null>;
  getUserFormsCount(userId: string): Promise<number>;

  // Form operations
  getForm(id: string): Promise<Form | null>;
  getForms(userId: string): Promise<Form[]>;
  getFormsByStatus(userId: string, status: string): Promise<Form[]>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<Form>): Promise<Form | null>;
  deleteForm(id: string): Promise<boolean>;
  incrementFormViews(id: string): Promise<Form | null>;

  // Form submission operations
  getSubmission(id: string): Promise<FormSubmission | null>;
  getSubmissions(formId: string): Promise<FormSubmission[]>;
  getSubmissionsByDateRange(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FormSubmission[]>;
  createSubmission(
    submission: InsertFormSubmission
  ): Promise<FormSubmission>;

  // View record operations
  createViewRecord(viewRecord: InsertViewRecord): Promise<ViewRecord>;
  getFormViews(formId: string): Promise<number>;
  getFormViewsByDateRange(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ViewRecord[]>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private dbName: string;

  constructor(uri: string, dbName: string) {
    if (!uri) {
      throw new Error("MongoDB URI is required");
    }
    this.client = new MongoClient(uri);
    this.dbName = dbName;
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  async getFile(filePath: string) {
    // Implement logic to locate the file based on the filePath
    const fullPath = path.join(__dirname, "uploads", filePath); // Adjust the path as necessary
    // Check if the file exists
    if (fs.existsSync(fullPath)) {
      return { path: fullPath }; // Return the file path
    }
    return null; // File not found
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) });
      if (!user) return null;
      return this.transformUser(user);
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const user = await db.collection("users").findOne({ email });
      if (!user) return null;
      return this.transformUser(user);
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const user = await db.collection("users").findOne({ username });
      if (!user) return null;
      return this.transformUser(user);
    } catch (error) {
      console.error("Error getting user by username:", error);
      return null;
    }
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const user = await db
        .collection("users")
        .findOne({ verificationToken: token });
      if (!user) return null;
      return this.transformUser(user);
    } catch (error) {
      console.error("Error getting user by verification token:", error);
      return null;
    }
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const user = await db
        .collection("users")
        .findOne({
          resetPasswordToken: token,
          resetPasswordExpiry: { $gt: new Date() },
        });
      if (!user) return null;
      return this.transformUser(user);
    } catch (error) {
      console.error("Error getting user by reset token:", error);
      return null;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      console.log('call here 11111 ????');

      const db = this.client.db(this.dbName);
      const now = new Date();
      
      const userToInsert = {
        ...userData,
        planType: "premium",
        createdAt: now,
        updatedAt: now,
      };

      const result = await db.collection("users").insertOne(userToInsert);
      
      return {
        id: result.insertedId.toString(),
        ...userToInsert,
      } as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const updateData = {
        ...userData,
        updatedAt: new Date(),
      };
      const result = await db.collection("users").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) return null;
      return this.transformUser(result);
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  async verifyUser(id: string): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const result = await db.collection("users").findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: { isVerified: true, verificationToken: null, updatedAt: new Date() },
        },
        { returnDocument: "after" }
      );
      if (!result) return null;
      return this.transformUser(result);
    } catch (error) {
      console.error("Error verifying user:", error);
      return null;
    }
  }

  async updateStripeInfo(
    userId: string,
    customerId: string,
    subscriptionId?: string
  ): Promise<User | null> {
    try {
      const db = this.client.db(this.dbName);
      const updateData: any = {
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      };

      if (subscriptionId) {
        updateData.stripeSubscriptionId = subscriptionId;
        updateData.planType = "premium";
      }

      const result = await db.collection("users").findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) return null;
      return this.transformUser(result);
    } catch (error) {
      console.error("Error updating user stripe info:", error);
      return null;
    }
  }

  async getUserFormsCount(userId: string): Promise<number> {
    try {
      const db = this.client.db(this.dbName);
      return await db
        .collection("forms")
        .countDocuments({ userId });
    } catch (error) {
      console.error("Error getting user forms count:", error);
      return 0;
    }
  }

  // Form operations
  async getForm(id: string): Promise<Form | null> {
    try {
      const db = this.client.db(this.dbName);
      const form = await db
        .collection("forms")
        .findOne({ _id: new ObjectId(id) });
      if (!form) return null;
      return this.transformForm(form);
    } catch (error) {
      console.error("Error getting form:", error);
      return null;
    }
  }

  async getForms(userId: string): Promise<Form[]> {
    try {
      const db = this.client.db(this.dbName);
      const forms = await db
        .collection("forms")
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray();
      return forms.map(this.transformForm);
    } catch (error) {
      console.error("Error getting forms:", error);
      return [];
    }
  }

  async getFormsByStatus(userId: string, status: string): Promise<Form[]> {
    try {
      const db = this.client.db(this.dbName);
      const forms = await db
        .collection("forms")
        .find({ userId, status })
        .sort({ updatedAt: -1 })
        .toArray();
      return forms.map(this.transformForm);
    } catch (error) {
      console.error("Error getting forms by status:", error);
      return [];
    }
  }

  async createForm(formData: InsertForm): Promise<Form> {
    try {
      const db = this.client.db(this.dbName);
      const now = new Date();
      const formToInsert = {
        ...formData,
        createdAt: now,
        updatedAt: now,
        views: 0,
      };
      const result = await db.collection("forms").insertOne(formToInsert);
      return {
        id: result.insertedId.toString(),
        ...formToInsert,
      } as Form;
    } catch (error) {
      console.error("Error creating form:", error);
      throw error;
    }
  }

  async updateForm(id: string, formData: Partial<Form>): Promise<Form | null> {
    try {
      const db = this.client.db(this.dbName);
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      };
      const result = await db.collection("forms").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) return null;
      return this.transformForm(result);
    } catch (error) {
      console.error("Error updating form:", error);
      return null;
    }
  }

  async deleteForm(id: string): Promise<boolean> {
    try {
      const db = this.client.db(this.dbName);
      const result = await db
        .collection("forms")
        .deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting form:", error);
      return false;
    }
  }

  async incrementFormViews(id: string): Promise<Form | null> {
    try {
      const db = this.client.db(this.dbName);
      const result = await db.collection("forms").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { views: 1 }, $set: { updatedAt: new Date() } },
        { returnDocument: "after" }
      );
      if (!result) return null;
      return this.transformForm(result);
    } catch (error) {
      console.error("Error incrementing form views:", error);
      return null;
    }
  }

  // Form submission operations
  async getSubmission(id: string): Promise<FormSubmission | null> {
    try {
      const db = this.client.db(this.dbName);
      const submission = await db
        .collection("submissions")
        .findOne({ _id: new ObjectId(id) });
      if (!submission) return null;
      return this.transformSubmission(submission);
    } catch (error) {
      console.error("Error getting submission:", error);
      return null;
    }
  }

  async getSubmissions(formId: string): Promise<FormSubmission[]> {
    try {
      const db = this.client.db(this.dbName);
      const submissions = await db
        .collection("submissions")
        .find({ formId })
        .sort({ createdAt: -1 })
        .toArray();
      return submissions.map(this.transformSubmission);
    } catch (error) {
      console.error("Error getting submissions:", error);
      return [];
    }
  }

  async getSubmissionsByDateRange(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FormSubmission[]> {
    try {
      const db = this.client.db(this.dbName);
      const submissions = await db
        .collection("submissions")
        .find({
          formId,
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .sort({ createdAt: -1 })
        .toArray();
      return submissions.map(this.transformSubmission);
    } catch (error) {
      console.error("Error getting submissions by date range:", error);
      return [];
    }
  }

  async createSubmission(
    submissionData: InsertFormSubmission
  ): Promise<FormSubmission> {
    try {
      const db = this.client.db(this.dbName);
      const now = new Date();
      const submissionToInsert = {
        ...submissionData,
        createdAt: now,
      };
      const result = await db
        .collection("submissions")
        .insertOne(submissionToInsert);
      return {
        id: result.insertedId.toString(),
        ...submissionToInsert,
      } as FormSubmission;
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  }

  // View record operations
  async createViewRecord(viewData: InsertViewRecord): Promise<ViewRecord> {
    try {
      const db = this.client.db(this.dbName);
      const now = new Date();
      const viewToInsert = {
        ...viewData,
        timestamp: now,
      };
      const result = await db.collection("views").insertOne(viewToInsert);
      return {
        id: result.insertedId.toString(),
        ...viewToInsert,
      } as ViewRecord;
    } catch (error) {
      console.error("Error creating view record:", error);
      throw error;
    }
  }

  async getFormViews(formId: string): Promise<number> {
    try {
      const db = this.client.db(this.dbName);
      return await db.collection("views").countDocuments({ formId });
    } catch (error) {
      console.error("Error getting form views:", error);
      return 0;
    }
  }

  async getFormViewsByDateRange(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ViewRecord[]> {
    try {
      const db = this.client.db(this.dbName);
      const views = await db
        .collection("views")
        .find({
          formId,
          timestamp: { $gte: startDate, $lte: endDate },
        })
        .sort({ timestamp: -1 })
        .toArray();
      return views.map(this.transformViewRecord);
    } catch (error) {
      console.error("Error getting form views by date range:", error);
      return [];
    }
  }

  // Helper methods to transform MongoDB documents
  private transformUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      username: doc.username,
      password: doc.password,
      isVerified: doc.isVerified,
      verificationToken: doc.verificationToken,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpiry: doc.resetPasswordExpiry,
      planType: doc.planType,
      stripeCustomerId: doc.stripeCustomerId,
      stripeSubscriptionId: doc.stripeSubscriptionId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private transformForm(doc: any): Form {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      elements: doc.elements,
      settings: doc.settings,
      theme: doc.theme,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      expiresAt: doc.expiresAt,
      shareUrl: doc.shareUrl,
      embedCode: doc.embedCode,
      views: doc.views,
    };
  }

  private transformSubmission(doc: any): FormSubmission {
    return {
      id: doc._id.toString(),
      formId: doc.formId,
      data: doc.data,
      createdAt: doc.createdAt,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      geoLocation: doc.geoLocation,
    };
  }

  private transformViewRecord(doc: any): ViewRecord {
    return {
      id: doc._id.toString(),
      formId: doc.formId,
      timestamp: doc.timestamp,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      geoLocation: doc.geoLocation,
      referrer: doc.referrer,
    };
  }
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private forms: Form[] = [];
  private submissions: FormSubmission[] = [];
  private viewRecords: ViewRecord[] = [];

  // User operations
  async getUser(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    return this.users.find(user => user.verificationToken === token) || null;
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    return this.users.find(user => 
      user.resetPasswordToken === token && 
      user.resetPasswordExpiry !== undefined && 
      new Date(user.resetPasswordExpiry) > new Date()
    ) || null;
  }

  async createUser(userData: InsertUser): Promise<User> {

    console.log('or call here ???????');
    
    const user: User = {
      id: Math.random().toString(36).substring(2, 15),
      ...userData,
      isVerified: false,
      planType: "premium",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date(),
    };
    
    return this.users[index];
  }

  async verifyUser(id: string): Promise<User | null> {
    const user = await this.getUser(id);
    if (!user) return null;
    
    return this.updateUser(id, {
      isVerified: true,
      verificationToken: undefined,
    });
  }

  async updateStripeInfo(
    userId: string,
    customerId: string,
    subscriptionId?: string
  ): Promise<User | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    return this.updateUser(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      planType: subscriptionId ? "premium" : "free",
    });
  }

  async getUserFormsCount(userId: string): Promise<number> {
    return this.forms.filter(form => form.userId === userId).length;
  }

  // Form operations
  async getForm(id: string): Promise<Form | null> {
    return this.forms.find(form => form.id === id) || null;
  }

  async getForms(userId: string): Promise<Form[]> {
    return this.forms.filter(form => form.userId === userId);
  }

  async getFormsByStatus(userId: string, status: string): Promise<Form[]> {
    return this.forms.filter(form => form.userId === userId && form.status === status);
  }

  async createForm(formData: InsertForm): Promise<Form> {
    const form: Form = {
      id: Math.random().toString(36).substring(2, 15),
      ...formData,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.forms.push(form);
    return form;
  }

  async updateForm(id: string, formData: Partial<Form>): Promise<Form | null> {
    const index = this.forms.findIndex(form => form.id === id);
    if (index === -1) return null;
    
    this.forms[index] = {
      ...this.forms[index],
      ...formData,
      updatedAt: new Date(),
    };
    
    return this.forms[index];
  }

  async deleteForm(id: string): Promise<boolean> {
    const index = this.forms.findIndex(form => form.id === id);
    if (index === -1) return false;
    
    this.forms.splice(index, 1);
    return true;
  }

  async incrementFormViews(id: string): Promise<Form | null> {
    const form = await this.getForm(id);
    if (!form) return null;
    
    return this.updateForm(id, {
      views: form.views + 1,
    });
  }

  // Form submission operations
  async getSubmission(id: string): Promise<FormSubmission | null> {
    return this.submissions.find(sub => sub.id === id) || null;
  }

  async getSubmissions(formId: string): Promise<FormSubmission[]> {
    return this.submissions.filter(sub => sub.formId === formId);
  }

  async getSubmissionsByDateRange(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FormSubmission[]> {
    return this.submissions.filter(sub => 
      sub.formId === formId && 
      sub.createdAt >= startDate && 
      sub.createdAt <= endDate
    );
  }

  async createSubmission(submissionData: InsertFormSubmission): Promise<FormSubmission> {
    const submission: FormSubmission = {
      id: Math.random().toString(36).substring(2, 15),
      ...submissionData,
      createdAt: new Date(),
    };
    this.submissions.push(submission);
    return submission;
  }

  // View record operations
  async createViewRecord(viewData: InsertViewRecord): Promise<ViewRecord> {
    const viewRecord: ViewRecord = {
      id: Math.random().toString(36).substring(2, 15),
      ...viewData,
      timestamp: new Date(),
    };
    this.viewRecords.push(viewRecord);
    return viewRecord;
  }

  async getFormViews(formId: string): Promise<number> {
    return this.viewRecords.filter(record => record.formId === formId).length;
  }

  async getFormViewsByDateRange(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ViewRecord[]> {
    return this.viewRecords.filter(record => 
      record.formId === formId && 
      record.timestamp >= startDate && 
      record.timestamp <= endDate
    );
  }
}

// Initialize MongoDB connection
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://hanonymous371:YlKHdJPyd9xJn4aI@cluster0.evl26.mongodb.net/?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB_NAME || "formcraft";

// Create storage instance
let storageInstance: IStorage;

if (mongoUri) {
  const mongoStorage = new MongoStorage(mongoUri, dbName);
  // Connect to MongoDB
  mongoStorage.connect().catch(console.error);
  storageInstance = mongoStorage;
} else {
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
