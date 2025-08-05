package automation_Test;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.testng.annotations.BeforeSuite;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import io.qameta.allure.Allure;
import io.qameta.allure.model.Label;
import reusableComponents.ReadDataFromDatasheet;
import testBase.TestBase;

@Listeners(com.aventstack.chaintest.plugins.ChainTestListener.class)
public class EndToEndTests_Form extends TestBase {
	private static String homedir;
	private ThreadLocal<String> testName = new ThreadLocal<String>();
	private String scenario;

	@BeforeSuite
	public void setUp() {
		homedir = System.getProperty("user.dir");
//        chainTestListener = new ChainTestListener();
	}
//	@BeforeMethod
//	public void setMethodName(Method method, Object[] row, ITestContext context) {
//	    String applicationName = (String) row[0]; // Get app name from data provider
//	    testName.set(applicationName);
//	    context.setAttribute("testName", applicationName);
//	}

//	@Test
//	public void Execution() throws Exception {
//	    String browser = System.getProperty("browser");
//	    String dataSheetName = System.getProperty("sheet");
////		 String browser = "chrome";
////		    String dataSheetName = "Groww.xlsx";
//	    System.out.println("Browser: " + browser);
//	    System.out.println("Sheet: " + dataSheetName);
//
//	    launchBrowser(browser);
//	    ReadDataFromDatasheet.getDataFromSheet(dataSheetName);
////	    getDriver().quit();
//	}

	@Test(dataProvider = "scenarioData")
	public void Execution(String sheetName, String scenario, String browser, String applicationName, String reportDir) throws Exception {
	    System.out.println("Browser: " + browser);
	    System.out.println("Sheet: " + sheetName);
	    System.out.println("Scenario: " + scenario);
	    System.out.println("App Name: " + applicationName);
	    System.out.println("Report Folder: " + reportDir);

	    // Set Allure results directory
	    System.setProperty("allure.results.directory", reportDir);

	    launchBrowser(browser);

	    // Allure metadata
	    Allure.getLifecycle().updateTestCase(testResult -> {
	        testResult.setName("[" + applicationName + "] " + scenario + " Execution");
	        testResult.setDescription("App: " + applicationName + "\nSheet: " + sheetName + "\nScenario: " + scenario);
	        testResult.getLabels().add(new Label().setName("feature").setValue(applicationName));
	        testResult.getLabels().add(new Label().setName("story").setValue(scenario));
	    });

	    Allure.step("Executing scenario: " + scenario + " for sheet: " + sheetName, () -> {
	        Allure.addAttachment("Excel Sheet Used", sheetName);
	        ReadDataFromDatasheet.getDataFromSheet(sheetName, scenario);
	    });

//	    getDriver().quit();

	    System.out.println("To view report, run:\nallure serve " + reportDir);
	}

//	@Test
//	public void Execution() throws Exception {
//		String browser = System.getProperty("browser");
//		String dataSheetNames = System.getProperty("sheet"); // Comma-separated sheet names
//		String applicationName = System.getProperty("appName");
//		String scenariosString = System.getProperty("scenario"); // Comma-separated scenario list
////		String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
//		String reportDir = System.getProperty("allure.results.directory");
//
//		System.out.println("Browser: " + browser);
//		System.out.println("Sheets: " + dataSheetNames);
//		System.out.println("App Name: " + applicationName);
//		System.out.println("Report Folder: " + reportDir);
//
//		// Create a folder for each report
//		System.setProperty("allure.results.directory", reportDir);
//
//		// Launch the browser
//
//		String br = null;
//		if (dataSheetNames != null && !dataSheetNames.isEmpty()) {
//			String[] sheetNames = dataSheetNames.split(",");
//			String[] browsers = browser.split(",");
//			String[] scenarios = scenariosString != null ? scenariosString.split(",") : new String[sheetNames.length];
//
//			for (int i = 0; i < sheetNames.length; i++) {
//				String sheetName = sheetNames[i].trim();
//				String scenario = (i < scenarios.length) ? scenarios[i].trim() : "DefaultScenario";
//
//				final String currentSheet = sheetName;
//				final String currentScenario = scenario;
//
//				System.out.println("Processing sheet: " + currentSheet + " | Scenario: " + currentScenario);
//				if (br == null) {
//					br = (i < browsers.length) ? browsers[i].trim() : "Chrome";
//					launchBrowser(br);
//				}
//
//				// Add test metadata in Allure
//				Allure.getLifecycle().updateTestCase(testResult -> {
//					testResult.setName("[" + applicationName + "] " + currentScenario + " Execution");
//					testResult.setDescription(
//							"App: " + applicationName + "\nSheet: " + currentSheet + "\nScenario: " + currentScenario);
//					testResult.getLabels().add(new Label().setName("feature").setValue(applicationName));
//					testResult.getLabels().add(new Label().setName("story").setValue(currentScenario));
//				});
//
//				Allure.step("Executing scenario: " + currentScenario + " for sheet: " + currentSheet, () -> {
//					Allure.addAttachment("Excel Sheet Used", currentSheet);
//					ReadDataFromDatasheet.getDataFromSheet(currentSheet, currentScenario);
//				});
//			}
//		} else {
//			System.out.println("No sheets provided to process.");
//		}
//
//		// Quit the browser
//		getDriver().quit();
//
//		// OPTIONAL: Print command to serve report
//		System.out.println("To view report, run:");
//		System.out.println("allure serve " + reportDir);
//	}


	@DataProvider(name = "scenarioData")
	public Object[][] scenarioData() {
	    String dataSheetNames = System.getProperty("sheet");
	    String applicationName = System.getProperty("appName");
	    String scenariosString = System.getProperty("scenario");
	    String browser = System.getProperty("browser", "Chrome");
	    String reportDir = System.getProperty("allure.results.directory");

	    String[] sheets = dataSheetNames != null ? dataSheetNames.split(",") : new String[0];
	    String[] scenarios = scenariosString != null ? scenariosString.split(",") : new String[sheets.length];
	    String[] browsers = browser != null ? browser.split(",") : new String[sheets.length];

	    List<Object[]> data = new ArrayList<>();

	    for (int i = 0; i < sheets.length; i++) {
	        String s = sheets[i].trim();
	        String sc = (i < scenarios.length) ? scenarios[i].trim() : "DefaultScenario";
	        String br = (i < browsers.length) ? browsers[i].trim() : "Chrome";
	        data.add(new Object[]{s, sc, br, applicationName, reportDir});
	    }

	    return data.toArray(new Object[0][]);
	}

//	@DataProvider(parallel = false)
//	public Object[][] getTestData() {
//		String queryForController = "SELECT * FROM Controller WHERE RunStatus='Y'";
//		Fillo fillo = new Fillo();
//		Object[][] data = null;
//
//		try {
//			Connection con = fillo.getConnection(homedir + "/Resources/Controller_Web.xlsx");
//			Recordset rsController = con.executeQuery(queryForController);
//
//			int rowCount = rsController.getCount();
//			data = new Object[rowCount][3];
//
//			int i = 0;
//			while (rsController.next()) {
//				data[i][0] = rsController.getField("Application_Name");
//				data[i][1] = rsController.getField("Browser");
//				data[i][2] = rsController.getField("DataSheet_Name");
//				i++;
//			}
//
//		} catch (Exception e) {
//			System.out.println("Unable to Connect to Controller..........");
//			e.printStackTrace();
//		}
//
//		return data;
//	}

//	@AfterMethod
//	public void cleanUp(ITestResult result) {
//	    if (result.getStatus() == ITestResult.FAILURE) {
////	        String screenshotPath = captureScreenshot(driver, result.getName());
//	        ChainTestListener.log("❌ Test Failed: " + result.getName() );
//	    }
//	    closeDriver();
//	}
	public static String getHomedir() {
		return homedir;
	}

	public static void setHomedir(String homedir) {
		EndToEndTests_Form.homedir = homedir;
	}

	public ThreadLocal<String> getTestName() {
		return testName;
	}

	public void setTestName(ThreadLocal<String> testName) {
		this.testName = testName;
	}

	public String getScenario() {
		return scenario;
	}

	public void setScenario(String scenario) {
		this.scenario = scenario;
	}
}
