package reusableComponents;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.codoid.products.exception.FilloException;
import com.codoid.products.fillo.Connection;
import com.codoid.products.fillo.Fillo;
import com.codoid.products.fillo.Recordset;

import io.qameta.allure.Allure;

public class ReadDataFromDatasheet {



	private static HashMap<String, String> map = new HashMap<>();  // ✅ Initialize here

	public static HashMap<String, String> getMap() {
	    return map;
	}

	public static void setMap(HashMap<String, String> map) {
	    ReadDataFromDatasheet.map = map;
	}

	public static void getDataFromSheet(String dataSheetName, String scenario) {
	    Fillo fillo = new Fillo();
	    Connection con = null;

	    try {
	    	String filePath = System.getProperty("user.dir") + File.separator + ".." + File.separator + "automation-ui-frontend" + File.separator + "public" + File.separator + "resources" + File.separator + "TestData" + File.separator + dataSheetName;
	        System.out.println(filePath);
	        con = fillo.getConnection(filePath);
	        Recordset rs = con.executeQuery("SELECT * FROM Sheet1 WHERE RunStatus='Y'");

	        while (rs.next()) {
	            Map<String, String> testStep = new HashMap<>();
	            testStep.put("objectTypeDS", rs.getField("ObjectType"));
	            testStep.put("objectDS", rs.getField("Object"));
	            testStep.put("performDS", rs.getField("Perform"));
	            testStep.put("valuesDS", rs.getField("DataValues"));
	            testStep.put("testStep", rs.getField("Step_Description"));

	            // ✅ Store step in global map for reference
	            setMap((HashMap<String, String>) testStep);
	            
	            // ✅ Validate and perform action for this step
	            System.out.println("Executing Step: " + testStep);
	            Allure.step("Executing Step: " + testStep.get("testStep"), () -> {
//	                performAction(row);
	                Validator.validateObjects(List.of(testStep));
	            });
	            
	        }
//	        try {
//				Thread.sleep(10000);
//			} catch (InterruptedException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}

	    } catch (FilloException e) {
	        e.printStackTrace();
	    } finally {
	        if (con != null) {
	            con.close();
	        }
	    }
	}
	
}
